const { Week, ReviewCheck, WeekDraft, StudentInstance, TeacherInstance, User } = require('../models')
const helper = require('../helpers/weeksControllerHelper')
const logger = require('../utils/logger')
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

module.exports = {
  /**
   * Submit a week review
   *   permissions: must be a teacher/instructor on the course
   *
   * @param {*} req
   * @param {*} res
   */
  async create(req, res) {
    try {
      if (!helper.controllerBeforeAuthCheckAction(req, res)) {
        return
      }

      if (!req.authenticated.success) {
        return res.status(400).send('Token verification failed.')
      }

      // Check that there is a TeacherInstance for this user and this course.
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: req.body.studentInstanceId
        }
      })
      const ownTeacherInstanceId = await helper.getTeacherId(req.decoded.id, studentInstance.courseInstanceId)
      if (!ownTeacherInstanceId) {
        res.status(400).send('You must be a teacher to give points.')
        return
      }

      let week = await Week.findOne({
        where: {
          weekNumber: req.body.weekNumber,
          studentInstanceId: req.body.studentInstanceId
        }
      })

      const conflict = await findSaveConflict(req, week, studentInstance, ownTeacherInstanceId)
      if (conflict) {
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

      // Collect checklist checks from DB to this object
      // This is to keep backend backwards compatible
      const checksObject = {}

      if (week) {
        const updatedChecks = req.body.checks || {}
        week.set({
          points: 'points' in req.body ? nullIfEmpty(req.body.points) : week.points,
          grade: 'grade' in req.body ? nullIfEmpty(req.body.grade) : week.grade,
          feedback: 'feedback' in req.body ? (req.body.feedback || '') : week.feedback,
          instructorNotes: 'instructorNotes' in req.body ? (req.body.instructorNotes || '') : week.instructorNotes,
          updatedBy: req.decoded.id
        })
        // every save is a new version, also when only checklist checks (another table) changed
        week.changed('updatedAt', true)
        await week.save()
        await Promise.all(Object.keys(updatedChecks).map(check => ReviewCheck.findOrCreate({
          where: {
            checklistItemId: Number(check),
            weekId: week.id
          }
        }).then(reviewCheck => ReviewCheck.update({
          checked: updatedChecks[check]
        }, {
          where: {
            id: reviewCheck[0].dataValues.id
          },
          returning: true
        })).then(([_, [updatedReviewCheck]]) => {
          checksObject[updatedReviewCheck.checklistItemId] = updatedReviewCheck.dataValues.checked
        })))
      } else {
        week = await Week.create({
          points: nullIfEmpty(req.body.points),
          grade: nullIfEmpty(req.body.grade),
          studentInstanceId: req.body.studentInstanceId,
          feedback: req.body.feedback || '',
          instructorNotes: req.body.instructorNotes || '',
          weekNumber: req.body.weekNumber,
          notified: false,
          updatedBy: req.decoded.id
        })
        await Promise.all(Object.keys(req.body.checks).map(check => ReviewCheck.create({
          checklistItemId: Number(check),
          checked: req.body.checks[check],
          weekId: week.id
        }).then((reviewCheck) => {
          checksObject[reviewCheck.checklistItemId] = reviewCheck.checked
        })))
      }

      const changes = {}
      addValueChange(changes, 'points', before.points, week.points, { numeric: true })
      addValueChange(changes, 'grade', before.grade, week.grade, { numeric: true })
      addValueChange(changes, 'feedback', before.feedback, week.feedback)
      addValueChange(changes, 'instructorNotes', before.instructorNotes, week.instructorNotes)
      await addChecklistChanges(changes, checksBefore, { ...checksBefore, ...checksObject })
      await logChange({
        courseInstanceId: studentInstance.courseInstanceId,
        studentInstanceId: studentInstance.id,
        userId: req.decoded.id,
        kind: 'week_review',
        number: Number(req.body.weekNumber),
        changes,
        initial: Object.keys(before).length === 0
      })

      // Remove draft.
      await WeekDraft.destroy({
        where: {
          weekNumber: req.body.weekNumber,
          studentInstanceId: req.body.studentInstanceId
        }
      })
      res.status(200).send({ ...week.dataValues, checks: checksObject })
    } catch (error) {
      logger.error('Create weeks error.')
      logger.error(error)
      res.status(500).send(error.message)
    }
  },

  /**
   * Get week review draft
   *   permissions: must be a teacher/instructor on the course
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  async getDraft(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      // Check that there is a TeacherInstance for this user and this course.
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: req.body.studentInstanceId
        }
      })
      const isTeacher = await helper.getTeacherId(req.decoded.id, studentInstance.courseInstanceId)
      if (!isTeacher) {
        res.status(400).send('You must be a teacher to get review drafts.')
        return
      }

      const weekDraft = await WeekDraft.findOne({
        where: {
          weekNumber: req.body.weekNumber,
          studentInstanceId: req.body.studentInstanceId
        }
      })

      if (weekDraft) {
        res.status(200).send(weekDraft)
      } else {
        res.status(204).send()
      }
    }
  },

  /**
   * Save week review draft
   *   permissions: must be a teacher/instructor on the course
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  async saveDraft(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      // Check that there is a TeacherInstance for this user and this course.
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: req.body.studentInstanceId
        }
      })
      const isTeacher = await helper.getTeacherId(req.decoded.id, studentInstance.courseInstanceId)
      if (!isTeacher) {
        res.status(400).send('You must be a teacher to save review drafts.')
        return
      }

      const weekDraft = await WeekDraft.findOne({
        where: {
          weekNumber: req.body.weekNumber,
          studentInstanceId: req.body.studentInstanceId
        }
      })
      if (weekDraft) {
        await weekDraft.update({
          data: req.body.reviewData
        })
      } else {
        await WeekDraft.create({
          studentInstanceId: req.body.studentInstanceId,
          weekNumber: req.body.weekNumber,
          data: req.body.reviewData
        })
      }
      res.status(200).send(weekDraft)
    }
  }
}
