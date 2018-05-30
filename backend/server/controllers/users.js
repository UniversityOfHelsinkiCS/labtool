const User = require('../models').User
const jwt = require('jsonwebtoken')
const CourseInstance = require('../models').CourseInstance
const TeacherInstance = require('../models').TeacherInstance
const helper = require('../helpers/users_controller_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   * @returns {*}
   */
  update(req, res) {
    helper.controller_before_auth_check_action(req, res)

    if (!req.body.email || req.body.email.length < 1) {
      const error = { error: 'Email was too short... Implementing valid email check can be done here' }
      res.status(400).send(error)
    } else {
      User.update({ email: req.body.email }, { where: { id: req.decoded.id } }).then(
        User.findById(req.decoded.id)
          .then(user => {
            const returnedUser = {
              email: req.body.email,
              firsts: user.firsts,
              lastname: user.lastname,
              studentNumber: user.studentNumber,
              username: user.username
            }
            res.status(201).send(returnedUser)
          })
          .catch(error => res.status(400).send(error))
      )
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  async list(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    if (req.authenticated.success) {
      try {
        // Make sure only teachers can get user list.
        const teacherInstances = await TeacherInstance.count({
          where: {
            userId: req.decoded.id
          }
        })

        if (!teacherInstances) {
          return res.status(401).send('Unauthorized')
        }

        const users = await User.findAll()
        res.status(200).send(users)
      } catch (exception) {
        res.status(400).send('Unable to send user list')
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*|Promise<T>>}
   */

  async createTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const courseInstance = await CourseInstance.findOne({
      where: {
        ohid: req.body.ohid
      }
    })

    const user = await User.findOne({
      where: {
        username: req.body.adTunnus
      }
    })

    if (courseInstance !== null && user !== null) {
      return TeacherInstance.create({
        userId: user.id,
        courseInstanceId: courseInstance.id,
        admin: true
      })
        .then(teacher => res.status(200).send(teacher))
        .catch(error => res.status(400).send(error))
    } else {
      res.status(404).send('not found')
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<*|Promise<T>>}
   */
  async createTeacher(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    if (req.authenticated.success) {
      try {
        // Make sure only teachers/assistants can add new teachers/assistants.
        const teacherInstances = await TeacherInstance.count({
          where: {
            userId: req.decoded.id
          }
        })

<<<<<<< HEAD
    try {
      // Make sure only teachers/assistants can add new teachers/assistants.

      const courseInstance = await CourseInstance.findOne({
        where: {
          ohid: req.body.ohid
        }
      })

      const teacherInstances = await TeacherInstance.count({
        where: {
          userId: req.decoded.id,
          courseInstanceId: courseInstance.id
=======
        if (!teacherInstances) {
          return res.status(401).send('Unauthorized')
>>>>>>> 441b08903152f49583a717a8174798aaba1215f0
        }

<<<<<<< HEAD
      if (!teacherInstances) {
        return res.status(400).send('You must be a teacher on the course to add assistants.')
      }
=======
        const userToAssistant = await User.findById(req.body.id)
        const courseToAssist = await CourseInstance.findOne({
          where: {
            ohid: req.body.ohid
          }
        })
>>>>>>> 441b08903152f49583a717a8174798aaba1215f0

        if (!userToAssistant || !courseToAssist) {
          return res.status(404).send('User or course not found')
        }

        const assistant = await TeacherInstance.create({
          userId: userToAssistant.id,
          courseInstanceId: courseToAssist.id,
          admin: true
        })
        res.status(200).send(assistant)
      } catch (exception) {
        res.status(400).send('Error in creating teacher/assistant')
      }
    }
  }
}
