const { Week, WeekDraft, StudentInstance } = require('../models')
const helper = require('../helpers/weeksControllerHelper')
const logger = require('../utils/logger')

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

      if (req.authenticated.success) {
        // Check that there is a TeacherInstance for this user and this course.
        const studentInstance = await StudentInstance.findOne({
          where: {
            id: req.body.studentInstanceId
          }
        })
        const isTeacher = await helper.getTeacherId(req.decoded.id, studentInstance.courseInstanceId)
        if (!isTeacher) {
          res.status(400).send('You must be a teacher to give points.')
          return
        }

        // Remove draft.
        await WeekDraft.destroy({
          where: {
            weekNumber: req.body.weekNumber,
            studentInstanceId: req.body.studentInstanceId
          }
        })

        const week = await Week.findOne({
          where: {
            weekNumber: req.body.weekNumber,
            studentInstanceId: req.body.studentInstanceId
          }
        })
        if (week) {
          let updatedChecks = {}
          if (req.body.checks) {
            Object.keys(week.checks).forEach((key) => {
              // handle existing cases where clItems were saved by name in week.checks
              if (!Number.isInteger(key)) {
                return
              }

              if (req.body.checks[key] !== undefined) {
                updatedChecks[key] = req.body.checks[key]
              } else {
                updatedChecks[key] = week.checks[key]
              }
            })
            Object.keys(req.body.checks).forEach((key) => {
              updatedChecks[key] = req.body.checks[key]
            })
          } else {
            updatedChecks = week.checks
          }
          await week.update({
            points: req.body.points || week.points,
            feedback: req.body.feedback || week.feedback,
            instructorNotes: req.body.instructorNotes || week.instructorNotes,
            checks: updatedChecks
          })
        } else {
          await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            feedback: req.body.feedback,
            instructorNotes: req.body.instructorNotes,
            weekNumber: req.body.weekNumber,
            notified: false,
            checks: req.body.checks
          })
        }
        res.status(200).send(week)
      } else {
        res.status(400).send('Token verification failed.')
      }
    } catch (error) {
      logger.error('Create weeks error.', { error: error.message })
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
