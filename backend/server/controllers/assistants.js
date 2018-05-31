const db = require('../models')
const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const AssistantInstance = require('../models').AssistantInstance
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
        await AssistantInstance.create({
          studentInstanceId: studentInsId,
          teacherInstanceId: teacherInsId
        })
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
      const assistantIns = await AssistantInstance.findOne({
        where: {
          studentInstanceId: req.params.id
        }
      })

      if (assistantIns) {
        const assistantId = assistantIns.teacherInstanceId
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
    console.log('Etsitään assarin oppilaat')

    helper.controller_before_auth_check_action(req, res)

    const returnedStudentsInfo = {
      status: undefined,
      data: undefined
    }
    console.log('req.params.id: ', req.params.id)

    try {
      AssistantInstance.findAll({
        where: {
          teacherInstanceId: req.params.id
        }
      }).then(assistantInstances => {
        assistantInstances.forEach(instance => {
          StudentInstance.findOne({
            where: {
              id: instance.id
            }
          }).then(studentInstances => {
            studentInstances.forEach(instance => {
              User.findOne({
                where: {
                  id: instance.userId
                }
              })
            })
          })
        })
      })

      console.log(typeof usersForTeacher)

      if (usersForTeacher) {
        returnedStudentsInfo.status = 'teacher has assigned students'
        returnedStudentsInfo.data = usersForTeacher

        res.status(200).send(returnedStudentsInfo)
      } else {
        returnedStudentsInfo.status = 'no students assigned for teacher'
        res.status(200).send(returnedStudentsInfo)
      }
    } catch (e) {
      console.log('\nVirhettä pukkaa\n\n')
      res.status(400).send(e)
    }
  }
}
