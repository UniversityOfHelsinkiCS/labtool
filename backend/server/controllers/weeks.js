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
            id: req.body.week
          }
        })
        if (week) {
          await week.update({
            points: week.points || req.body.points,
            studentInstanceId: week.studentInstanceId || req.body.studentInstanceId,
            feedback: week.feedback || req.body.feedback,
            weekNumber: week.weekNumber || req.body.weekNumber
          })
          res.status(200).send(week)
        } else {
          await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            feedback: req.body.feedback,
            weekNumber: req.body.weekNumber
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
