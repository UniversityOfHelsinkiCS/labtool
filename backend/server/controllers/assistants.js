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
  async findAssistantByStudentInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)

    const returnedAssistantInfo = {
      status: undefined,
      data: undefined
    }
    const assistantInstance = await assistantInstance.findOne({
      where: {
        studentInstance: req.body.studentId
      }
    })

    if (assistantInstance) {
      const assistantId = assistantInstance.teacherInstanceId
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

      try {
        res.status(200).send(returnedAssistantInfo)
      } catch (e) {
        res.status(400).send(e)
      }
    } else {
      try {
        returnedAssistantInfo.status = 'no assistant assigned to student'
        res.status(200).send(returnedAssistantInfo)
      } catch (e) {
        res.status(400).send(e)
      }
    }
  }
}
