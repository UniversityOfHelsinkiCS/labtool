const db = require('../models')
const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const User = require('../models').User
const helper = require('../helpers/course_instance_helper')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const StudentInstanceController = require('../controllers').studentInstances
const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]

module.exports = {
  async create(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    try {
      console.log('req.body: ', req.body, '\n\n')
      const teacherInsId = req.body.teacherInstanceId
      const studentInsId = req.body.studentInstanceId

      if (req.authenticated.success) {
        // TODO check that user is a teacher on the course
        // TODO check that given teacher and student are on the same course
        const userAsTeacher = await TeacherInstance.findOne
        const studentInstance = await StudentInstance.findOne({
          where: {
            id: studentInsId
          }
        })
        if (studentInstance) {
          console.log('\n\nFound the student instance')
          studentInstance.updateAttributes({
            teacherInstanceId: teacherInsId
          })
        } else {
          res.status(404).send('Specified student instance could not be found.')
        }
        res.status(200).send('assistanceInstance created')
      }
    } catch (e) {
      console.log('\n\nassistantInstance creation failed\n\n')
    }
  },

  async findAssistantByStudentInstance(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    const returnedAssistantInfo = {
      status: undefined,
      data: undefined
    }
    let studentInstanceId = undefined

    try {
      studentInstanceId = req.params.id
    } catch (e) {
      res.status(400).send(e)
    }

    try {
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: studentInstanceId
        }
      })

      if (studentInstance) {
        const assistantId = studentInstance.teacherInstanceId
        const assistantAsTeacher = await TeacherInstance.findOne({
          where: {
            id: assistantId
          }
        })
        const assistantAsUser = await User.findOne({
          where: {
            id: assistantAsTeacher.userId
          }
        })
        returnedAssistantInfo.data = {
          firsts: assistantAsUser.firsts,
          lastname: assistantAsUser.lastname
        }
        returnedAssistantInfo.status = 'student has an assigned assistant'

        res.status(200).send(returnedAssistantInfo)
      } else {
        returnedAssistantInfo.status = 'no assistant assigned to student'
        res.status(200).send(returnedAssistantInfo)
      }
    } catch (e) {
      console.log('\n\nAAAA\n\n')
      res.status(400).send(e)
    }
  },

  async findStudentsByTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    try {
      const teacherInsId = req.params.id
      console.log('\n\nteacherInsId: ', req.param.id)

      const studentsForThisTeacherInstance = await StudentInstance.findAll({
        where: {
          teacherInstanceId: teacherInsId
        }
      })
      res.status(200).send(studentsForThisTeacherInstance)
    } catch (e) {
      console.log('\nfindStudentsByTeacherInstance did not succeed\n\n')
      res.status(400).send(e)
    }
  }
}
