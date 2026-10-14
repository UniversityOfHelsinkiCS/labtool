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
const changesGrading = async (body, week) => {
  const asNumber = value => (nullIfEmpty(value) === null ? null : Number(value))
  if ('points' in body && asNumber(body.points) !== asNumber(week ? week.points : null)) return true
  if ('grade' in body && asNumber(body.grade) !== asNumber(week ? week.grade : null)) return true
  if ('feedback' in body && (body.feedback || '') !== ((week && week.feedback) || '')) return true
  const checks = body.checks || {}
  const savedChecks = week ? await ReviewCheck.findAll({ where: { weekId: week.id } }) : []
  const saved = Object.fromEntries(savedChecks.map(check => [check.checklistItemId, check.checked]))
  return Object.keys(checks).some(item => Boolean(checks[item]) !== Boolean(saved[item]))
}

/**
 * Checks that a review save does not silently overwrite someone else's work (#1127).
 * Returns the 409 response body, or null when the save may go ahead.
 *
 * - REVIEW_CHANGED: the review was saved after the page was opened (body.baseUpdatedAt is the
 *   version the page loaded, null for a new review). body.overwrite skips this check. Clients
 *   that do not send baseUpdatedAt are not checked.
 * - NOT_ASSIGNED_INSTRUCTOR: the student has an assigned instructor who is not the current user,
 *   and the save changes the grading. body.confirmedNotAssigned skips this check.
 */
const findSaveConflict = async (req, week, studentInstance, ownTeacherInstanceId) => {
  if ('baseUpdatedAt' in req.body && !req.body.overwrite) {
    const current = week ? week.updatedAt.toISOString() : null
    if (current !== (req.body.baseUpdatedAt || null)) {
      const savedBy = week && week.updatedBy ? await User.findByPk(week.updatedBy) : null
      return {
        code: 'REVIEW_CHANGED',
        message: `${fullName(savedBy)} saved this review after you opened it.`,
        updatedAt: current,
        updatedBy: savedBy ? fullName(savedBy) : null
      }
    }
  }

  const assignedId = studentInstance.teacherInstanceId
  if (assignedId && assignedId !== ownTeacherInstanceId && !req.body.confirmedNotAssigned
    && await changesGrading(req.body, week)) {
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

// the review page sends ids from the URL, as strings
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

    const conflict = await findSaveConflict(req, week, studentInstance, ownTeacherInstanceId)
    if (conflict) {
      // the review page reads the whole body as the conflict (reviewSaveReducer)
      return res.status(409).send(conflict)
    }

    // the review before this save, for the change history (#1129)
    const before = week
      ? { points: week.points, grade: week.grade, feedback: week.feedback, instructorNotes: week.instructorNotes }
      : {}
    const checksBefore = week
      ? Object.fromEntries((await ReviewCheck.findAll({ where: { weekId: week.id } }))
        .map(check => [check.checklistItemId, check.checked]))
      : {}

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
    const { studentInstance, weekNumber } = await findStudentForStaff(req, 'You must be a teacher to save review drafts.')

    const weekDraft = await WeekDraft.findOne({
      where: { weekNumber, studentInstanceId: studentInstance.id }
    })
    if (weekDraft) {
      await weekDraft.update({
        data: req.body.reviewData
      })
    } else {
      await WeekDraft.create({
        studentInstanceId: studentInstance.id,
        weekNumber,
        data: req.body.reviewData
      })
    }
    res.status(200).send(weekDraft)
  }
}
