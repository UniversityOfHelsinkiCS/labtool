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
const logger = require('../utils/logger')

module.exports = {
  async create(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    try {
      const teacherInsId = req.body.teacherInstanceId
      const studentInsId = req.body.studentInstanceId

      if (!req.authenticated.success) {
        res.status(400).send('you have to be authenticated to do this')
        return
      }
      console.log('\n\nAuthentication succeeded')
      const requestMakerId = req.decoded.id
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: studentInsId
        }
      })
      if (!studentInstance) {
        res.status(404).send('Specified student instance could not be found.')
        return
      }
      if (!teacherInsId) {
        res.status(404).send(`Can't assign null teacher!`)
        return
      }
      const requestMakerAsTeacher = await TeacherInstance.findOne({
        where: {
          userId: requestMakerId,
          courseInstanceId: studentInstance.courseInstanceId
        }
      })
      if (!requestMakerAsTeacher) {
        res.status(400).send('You have to be an assistant or teacher in the same course as the student you are assigning a teacher to.')
        return
      }
      const requestMakersCoursesId = requestMakerAsTeacher.courseInstanceId
      const givenTeachersTeacherInstance = await TeacherInstance.findOne({
        where: {
          id: teacherInsId
        }
      })
      if (!givenTeachersTeacherInstance) {
        res.status(404).send('There is no teacher with the given teacherInstanceId')
        return
      }
      const teachersCourseId = givenTeachersTeacherInstance.courseInstanceId
      if (teachersCourseId !== requestMakersCoursesId) {
        res.status(400).send('You have to be an assistant or teacher in the same course as the teacher you are adding.')
        return
      }
      if (studentInstance.courseInstanceId !== teachersCourseId) {
        // This might be an unenterable code block.
        res.status(400).send('The teacher is not from the same course as this student.')
        return
      }
      console.log('\n\nCourses match')
      studentInstance.updateAttributes({
        teacherInstanceId: teacherInsId
      })
      res.status(200).send(studentInstance)
    } catch (e) {
      logger.error(e)
      console.log('\n\nAssistantInstance creation failed.\n', e)
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
      logger.error(e)
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
      logger.error(e)
      res.status(400).send(e)
    }
  },

  async findStudentsByTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    try {
      const teacherInsId = req.params.id

      const studentsForThisTeacherInstance = await StudentInstance.findAll({
        where: {
          teacherInstanceId: teacherInsId
        }
      })
      res.status(200).send(studentsForThisTeacherInstance)
    } catch (e) {
      logger.error(e)
      res.status(400).send(e)
    }
  }
}
