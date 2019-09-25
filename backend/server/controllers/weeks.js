const { Week, WeekDraft, StudentInstance } = require('../models')
const helper = require('../helpers/weeks_controller_helper')
const logger = require('../utils/logger')

module.exports = {
  async create(req, res) {
    try {
      await helper.controller_before_auth_check_action(req, res)

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
            Object.keys(week.checks).map((key) => {
              req.body.checks[key] !== undefined ? (updatedChecks[key] = req.body.checks[key]) : (updatedChecks[key] = week.checks[key])
            })
            Object.keys(req.body.checks).map((key) => {
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
        res.status(400).send('token verific ation failed')
      }
    } catch (error) {
      logger.error('create weeks error', { error: error.message })
    }
  },
  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  async getDraft(req, res) {
    helper.controller_before_auth_check_action(req, res)

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
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  async saveDraft(req, res) {
    helper.controller_before_auth_check_action(req, res)

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
  },
  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  list(req, res) {
    helper.controller_before_auth_check_action(req, res)

    return Week.all()
      .then(ui => res.status(200).send(ui))
      .catch((error) => {
        logger.error('list weeks error', { error: error.message })
        res.status(400).send(error)
      })
  },
  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Model>}
   */
  retrieve(req, res) {
    helper.controller_before_auth_check_action(req, res)

    return Week.findById(req.params.id, {})
      .then((week) => {
        if (!week) {
          return res.status(404).send({
            message: 'Teacher Instance not Found'
          })
        }
        return res.status(200).send(week)
      })
      .catch((error) => {
        logger.error('retrieve weeks error', { error: error.message })
        res.status(400).send(error)
      })
  }
}
