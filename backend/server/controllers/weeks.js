const {
  Week, ReviewCheck, WeekDraft, StudentInstance, TeacherInstance, User, CourseInstance, sequelize
} = require('../models')
const { isFinalReviewWeek } = require('../helpers/finalReview')
const { requireCourseStaff } = require('../helpers/auth')
const { badRequest, notFound } = require('../utils/httpError')
const { addValueChange, addChecklistChanges, logChange } = require('../helpers/changeLog')

const nullIfEmpty = value => (value === '' || value === null || value === undefined ? null : value)

const fullName = user => (user ? `${user.firsts} ${user.lastname}` : 'Someone')

// The fields of a review that grade the student; instructor notes are not one of them (#1127).
// saved is the review or draft saved now: { points, grade, feedback, checks: { checklistItemId: checked } }
const changesGrading = (body, saved) => {
  const asNumber = value => (nullIfEmpty(value) === null ? null : Number(value))
  if ('points' in body && asNumber(body.points) !== asNumber(saved.points)) return true
  if ('grade' in body && asNumber(body.grade) !== asNumber(saved.grade)) return true
  if ('feedback' in body && (body.feedback || '') !== (saved.feedback || '')) return true
  const checks = body.checks || {}
  const savedChecks = saved.checks || {}
  return Object.keys(checks).some(item => Boolean(checks[item]) !== Boolean(savedChecks[item]))
}

// the saved review in the shape of a draft's data, {} when there is none
const reviewAsData = async (week) => {
  if (!week) return {}
  const checks = await ReviewCheck.findAll({ where: { weekId: week.id } })
  return {
    points: week.points,
    grade: week.grade,
    feedback: week.feedback,
    instructorNotes: week.instructorNotes,
    checks: Object.fromEntries(checks.map(check => [check.checklistItemId, check.checked]))
  }
}

// has the review (or its draft) been saved since the version the page loaded?
const changedSince = async (saved, base, message) => {
  const current = saved ? saved.updatedAt.toISOString() : null
  if (current === (base || null)) return null
  const savedBy = saved && saved.updatedBy ? await User.findByPk(saved.updatedBy) : null
  return {
    code: 'REVIEW_CHANGED',
    message: `${fullName(savedBy)} ${message}`,
    updatedAt: current,
    updatedBy: savedBy ? fullName(savedBy) : null
  }
}

/**
 * Checks that a save of a review or of its draft does not silently overwrite someone else's work (#1127).
 * Returns the 409 response body, or null when the save may go ahead.
 *
 * - REVIEW_CHANGED: the review was saved after the page was opened (body.baseUpdatedAt is the
 *   version the page loaded, null for a new review), or its draft was (body.baseDraftUpdatedAt,
 *   null when there was no draft; saving the review removes the draft). body.overwrite skips
 *   this check. Clients that do not send the versions are not checked.
 * - NOT_ASSIGNED_INSTRUCTOR: the student has an assigned instructor who is not the current user,
 *   and the save changes the grading (gradingChanged). body.confirmedNotAssigned skips this check.
 */
const findSaveConflict = async (req, { week, draft, studentInstance, ownTeacherInstanceId, gradingChanged }) => {
  if (!req.body.overwrite) {
    const changed = ('baseUpdatedAt' in req.body
        && await changedSince(week, req.body.baseUpdatedAt, 'saved this review after you opened it.'))
      || ('baseDraftUpdatedAt' in req.body
        && await changedSince(draft, req.body.baseDraftUpdatedAt, 'saved a draft of this review after you opened it.'))
    if (changed) return changed
  }

  const assignedId = studentInstance.teacherInstanceId
  if (assignedId && assignedId !== ownTeacherInstanceId && !req.body.confirmedNotAssigned && gradingChanged) {
    const assigned = await TeacherInstance.findByPk(assignedId, { include: [User] })
    const assignedName = assigned ? fullName(assigned.User) : 'Another instructor'
    return {
      code: 'NOT_ASSIGNED_INSTRUCTOR',
      message: `${assignedName} is the instructor of this student, not you.`,
      assignedInstructor: assignedName
    }
  }
  return null
}

const isInteger = value => (typeof value === 'number' || typeof value === 'string')
  && value !== '' && Number.isInteger(Number(value))
const isChecksObject = value => value === undefined || value === null
  || (typeof value === 'object' && !Array.isArray(value))

/** The student instance of a review or a draft, when the current user is staff on its course. */
const findStudentForStaff = async (req, message) => {
  const { studentInstanceId, weekNumber } = req.body
  if (!isInteger(studentInstanceId) || !isInteger(weekNumber)) {
    throw badRequest('Missing or malformed inputs.')
  }
  const studentInstance = await StudentInstance.findByPk(Number(studentInstanceId))
  if (!studentInstance) {
    throw notFound('Student not found.')
  }
  const teacherInstanceId = await requireCourseStaff(req, studentInstance.courseInstanceId, message)
  return { studentInstance, teacherInstanceId, weekNumber: Number(weekNumber) }
}

/** Saves the checklist checks of a review; returns { checklistItemId: checked } of the saved checks. */
const saveChecks = async (week, checks, transaction) => {
  const saved = {}
  // sequentially: the queries share the transaction's connection
  for (const itemId of Object.keys(checks)) {
    const where = { checklistItemId: Number(itemId), weekId: week.id }
    const existing = await ReviewCheck.findOne({ where, transaction })
    if (existing) {
      await existing.update({ checked: checks[itemId] }, { transaction })
      saved[existing.checklistItemId] = existing.checked
    } else {
      const created = await ReviewCheck.create({ ...where, checked: checks[itemId] }, { transaction })
      saved[created.checklistItemId] = created.checked
    }
  }
  return saved
}

module.exports = {
  /**
   * Submit a week review
   *   permissions: must be a teacher/instructor on the course
   *
   * @param {*} req
   * @param {*} res
   */
  async create(req, res) {
    if (!isChecksObject(req.body.checks)) {
      throw badRequest('Missing or malformed inputs.')
    }
    const { studentInstance, teacherInstanceId: ownTeacherInstanceId, weekNumber } = await findStudentForStaff(
      req, 'You must be a teacher to give points.'
    )
    const checks = req.body.checks || {}

    let week = await Week.findOne({
      where: {
        weekNumber,
        studentInstanceId: studentInstance.id
      }
    })

    // In the final review only the assigned instructor edits the review notes; the rest of the staff
    // add notes of their own (ReviewNotes).
    const assignedId = studentInstance.teacherInstanceId
    if ('instructorNotes' in req.body && assignedId && assignedId !== ownTeacherInstanceId
      && (req.body.instructorNotes || '') !== ((week && week.instructorNotes) || '')) {
      const course = await CourseInstance.findByPk(studentInstance.courseInstanceId)
      if (isFinalReviewWeek(course, weekNumber)) {
        // the code tells the review page why; the body is kept as it is
        return res.status(403).send({
          code: 'NOTES_LOCKED',
          message: 'Only the assigned instructor can edit the review notes of the final review. Add a note of your own instead.'
        })
      }
    }

    // the review before this save, for the change history (#1129)
    const { checks: checksBefore = {}, ...before } = await reviewAsData(week)
    const draft = await WeekDraft.findOne({ where: { weekNumber, studentInstanceId: studentInstance.id } })

    const conflict = await findSaveConflict(req, {
      week,
      draft,
      studentInstance,
      ownTeacherInstanceId,
      gradingChanged: changesGrading(req.body, { ...before, checks: checksBefore })
    })
    if (conflict) {
      // the review page reads the whole body as the conflict (reviewSaveReducer)
      return res.status(409).send(conflict)
    }

    // the review, its checks, the change history row and the removal of the draft are saved together
    const checksObject = await sequelize.transaction(async (transaction) => {
      if (week) {
        week.set({
          points: 'points' in req.body ? nullIfEmpty(req.body.points) : week.points,
          grade: 'grade' in req.body ? nullIfEmpty(req.body.grade) : week.grade,
          feedback: 'feedback' in req.body ? (req.body.feedback || '') : week.feedback,
          instructorNotes: 'instructorNotes' in req.body ? (req.body.instructorNotes || '') : week.instructorNotes,
          updatedBy: req.decoded.id
        })
        // every save is a new version, also when only checklist checks (another table) changed
        week.changed('updatedAt', true)
        await week.save({ transaction })
      } else {
        week = await Week.create({
          points: nullIfEmpty(req.body.points),
          grade: nullIfEmpty(req.body.grade),
          studentInstanceId: studentInstance.id,
          feedback: req.body.feedback || '',
          instructorNotes: req.body.instructorNotes || '',
          weekNumber,
          notified: false,
          updatedBy: req.decoded.id
        }, { transaction })
      }
      const savedChecks = await saveChecks(week, checks, transaction)

      const changes = {}
      addValueChange(changes, 'points', before.points, week.points, { numeric: true })
      addValueChange(changes, 'grade', before.grade, week.grade, { numeric: true })
      addValueChange(changes, 'feedback', before.feedback, week.feedback)
      addValueChange(changes, 'instructorNotes', before.instructorNotes, week.instructorNotes)
      await addChecklistChanges(changes, checksBefore, { ...checksBefore, ...savedChecks })
      await logChange({
        courseInstanceId: studentInstance.courseInstanceId,
        studentInstanceId: studentInstance.id,
        userId: req.decoded.id,
        kind: 'week_review',
        number: weekNumber,
        changes,
        initial: Object.keys(before).length === 0
      }, { transaction })

      await WeekDraft.destroy({
        where: {
          weekNumber,
          studentInstanceId: studentInstance.id
        },
        transaction
      })
      return savedChecks
    })
    return res.status(200).send({ ...week.dataValues, checks: checksObject })
  },

  /**
   * Get week review draft
   *   permissions: must be a teacher/instructor on the course
   *
   * @param req
   * @param res
   */
  async getDraft(req, res) {
    const { studentInstance, weekNumber } = await findStudentForStaff(req, 'You must be a teacher to get review drafts.')

    const weekDraft = await WeekDraft.findOne({
      where: { weekNumber, studentInstanceId: studentInstance.id }
    })

    if (weekDraft) {
      res.status(200).send(weekDraft)
    } else {
      res.status(204).send()
    }
  },

  /**
   * Save week review draft
   *   permissions: must be a teacher/instructor on the course
   *
   * @param req
   * @param res
   */
  async saveDraft(req, res) {
    const reviewData = req.body.reviewData || {}
    if (typeof reviewData !== 'object' || Array.isArray(reviewData) || !isChecksObject(reviewData.checks)) {
      throw badRequest('Missing or malformed inputs.')
    }
    const { studentInstance, teacherInstanceId: ownTeacherInstanceId, weekNumber } = await findStudentForStaff(
      req, 'You must be a teacher to save review drafts.'
    )
    const where = { weekNumber, studentInstanceId: studentInstance.id }
    let weekDraft = await WeekDraft.findOne({ where })
    const week = await Week.findOne({ where })

    // a draft continues the earlier draft, or the saved review when there is none
    const { checks: checksBefore = {}, ...before } = weekDraft ? weekDraft.data || {} : await reviewAsData(week)

    const conflict = await findSaveConflict(req, {
      week,
      draft: weekDraft,
      studentInstance,
      ownTeacherInstanceId,
      gradingChanged: changesGrading(reviewData, { ...before, checks: checksBefore })
    })
    if (conflict) {
      // the review page reads the whole body as the conflict (reviewSaveReducer)
      return res.status(409).send(conflict)
    }

    // the first version: neither a draft nor a review before this save
    const initial = !weekDraft && !week
    // the draft and its change history row are saved together (#1129)
    await sequelize.transaction(async (transaction) => {
      if (weekDraft) {
        weekDraft.set({ data: reviewData, updatedBy: req.decoded.id })
        // every save is a new version, also when nothing changed
        weekDraft.changed('updatedAt', true)
        await weekDraft.save({ transaction })
      } else {
        weekDraft = await WeekDraft.create({ ...where, data: reviewData, updatedBy: req.decoded.id }, { transaction })
      }

      const changes = {}
      addValueChange(changes, 'points', before.points, reviewData.points, { numeric: true })
      addValueChange(changes, 'grade', before.grade, reviewData.grade, { numeric: true })
      addValueChange(changes, 'feedback', before.feedback, reviewData.feedback)
      addValueChange(changes, 'instructorNotes', before.instructorNotes, reviewData.instructorNotes)
      await addChecklistChanges(changes, checksBefore, { ...checksBefore, ...(reviewData.checks || {}) })
      await logChange({
        courseInstanceId: studentInstance.courseInstanceId,
        studentInstanceId: studentInstance.id,
        userId: req.decoded.id,
        kind: 'week_draft',
        number: weekNumber,
        changes,
        initial
      }, { transaction })
    })
    return res.status(200).send(weekDraft)
  }
}
