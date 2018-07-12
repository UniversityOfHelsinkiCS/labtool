const Week = require('../models').Week
const TeacherInstance = require('../models').TeacherInstance
const StudentInstance = require('../models').StudentInstance
const helper = require('../helpers/weeks_controller_helper')

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
        const teacherInstanceCount = await TeacherInstance.count({
          where: {
            userId: req.decoded.id,
            courseInstanceId: studentInstance.courseInstanceId
          }
        })
        // If there is no TeacherInstance, reject.
        if (teacherInstanceCount === 0) {
          res.status(400).send('You must be a teacher to give points.')
          return
        }

        const week = await Week.findOne({
          where: {
            weekNumber: req.body.weekNumber,
            studentInstanceId: req.body.studentInstanceId
          }
        })
        if (week) {
          let updatedChecks = {}
          if (req.body.checks) {
            Object.keys(week.checks).map(key => {
              req.body.checks[key] !== undefined ? (updatedChecks[key] = req.body.checks[key]) : (updatedChecks[key] = week.checks[key])
            })
            Object.keys(req.body.checks).map(key => {
              updatedChecks[key] = req.body.checks[key]
            })
          } else {
            updatedChecks = week.checks
          }
          await week.update({
            points: req.body.points || week.points,
            feedback: req.body.feedback || week.feedback,
            checks: updatedChecks
          })
          res.status(200).send(week)
        } else {
          await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            feedback: req.body.feedback,
            weekNumber: req.body.weekNumber,
            notified: false,
            checks: req.body.checks
          })
          res.status(200).send(week)
        }
        res.status(200).send
      } else {
        res.status(400).send('token verific ation failed')
      }
    } catch (error) {
      console.log('\nweeks, ', error, '\n')
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
      .catch(error => res.status(400).send(error))
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
      .then(week => {
        if (!week) {
          return res.status(404).send({
            message: 'Teacher Instance not Found'
          })
        }
        return res.status(200).send(week)
      })
      .catch(error => res.status(400).send(error))
  }
}
