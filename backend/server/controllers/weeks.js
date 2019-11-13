const { Week, ReviewCheck, WeekDraft, StudentInstance } = require('../models')
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

        let week = await Week.findOne({
          where: {
            weekNumber: req.body.weekNumber,
            studentInstanceId: req.body.studentInstanceId
          }
        })

        // Collect checklist checks from DB to this object
        // This is to keep backend backwards compatible
        const checksObject = {}

        if (week) {
          let updatedChecks = req.body.checks || {}
          await week.update({
            points: req.body.points || week.points,
            feedback: req.body.feedback || week.feedback,
            instructorNotes: req.body.instructorNotes || week.instructorNotes
          })
          await Promise.all(Object.keys(updatedChecks).map(check => ReviewCheck.findOrCreate({
            where: {
              checklistItemId: Number(check),
              weekId: week.id
            }
          }).then(reviewCheck => {
            return ReviewCheck.update({
              checked: updatedChecks[check]
            },{
              where: {
                id: reviewCheck[0].dataValues.id
              },
              returning: true
            })
          }).then(([_, [updatedReviewCheck]]) => {
            checksObject[updatedReviewCheck.checklistItemId] = updatedReviewCheck.dataValues.checked
          })))
        } else {
          week = await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            feedback: req.body.feedback,
            instructorNotes: req.body.instructorNotes,
            weekNumber: req.body.weekNumber,
            notified: false
          })
          await Promise.all(Object.keys(req.body.checks).map(check => ReviewCheck.create({
            checklistItemId: Number(check),
            checked: req.body.checks[check],
            weekId: week.id
          }).then((reviewCheck) => {
            checksObject[reviewCheck.checklistItemId] = reviewCheck.checked
          })))
        }
        res.status(200).send({ ...week.dataValues, checks: checksObject })
      } else {
        res.status(400).send('Token verification failed.')
      }
    } catch (error) {
      logger.error('create weeks error', { error: error.message })
      res.status(400).send({ error })
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
