const { Week, WeekCheck, WeekDraft, StudentInstance } = require('../models')
const helper = require('../helpers/weeksControllerHelper')
const logger = require('../utils/logger')

module.exports = {
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

        // Collect checklist checks from DB to this object
        // This is to keep backend backwards compatible
        const checksObject = {}

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
            instructorNotes: req.body.instructorNotes || week.instructorNotes
          })
          await Promise.all(Object.keys(updatedChecks).map(check => WeekCheck.findOrCreate({
            where: {
              checklistItemId: Number(check),
              weekId: week.id
            }
          }).then(weekCheck => weekCheck.update({
            checked: updatedChecks[check]
          }).then((updatedWeekCheck) => {
            checksObject[updatedWeekCheck.checklistItemId] = updatedWeekCheck.checked
          }))))
        } else {
          const week = await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            feedback: req.body.feedback,
            instructorNotes: req.body.instructorNotes,
            weekNumber: req.body.weekNumber,
            notified: false
          })
          await Promise.all(Object.keys(req.body.checks).map(check => WeekCheck.create({
            checklistItemId: Number(check),
            checked: req.body.checks[check],
            weekId: week.id
          }).then((weekCheck) => {
            checksObject[weekCheck.checklistItemId] = weekCheck.checked
          })))
        }
        res.status(200).send({ ...week, checks: checksObject })
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
  },
  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  list(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    return Week.findAll({ include: [WeekCheck] })
      .then(ui => res.status(200).send(ui.map(week => ({ ...week,
        checks: week.checks.reduce((checksObject, weekCheck) => ({ ...checksObject, [weekCheck.checklistItemId]: weekCheck.checked }), {}) }))))
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
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    return Week.findById(req.params.id, {})
      .then((week) => {
        if (!week) {
          return res.status(404).send({
            message: 'Teacher Instance not Found'
          })
        }
        return WeekCheck.findAll({
          where: {
            weekId: week.id
          }
        }).then((weekChecks) => {
          res.status(200).send({ ...week,
            checks: weekChecks.reduce((checksObject, weekCheck) => ({ ...checksObject, [weekCheck.checklistItemId]: weekCheck.checked }), {}) })
        })
      })
      .catch((error) => {
        logger.error('retrieve weeks error', { error: error.message })
        res.status(400).send(error)
      })
  }
}
