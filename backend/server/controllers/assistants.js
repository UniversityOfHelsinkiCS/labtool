const db = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../utils/logger')
/*
const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const StudentInstanceController = require('../controllers').studentInstances
const config = require('./../config/config.js')[env]
const Op = Sequelize.Op
*/

const { User, StudentInstance, TeacherInstance, CourseInstance } = db

module.exports = {
  /**
   * Associate instructor with student
   *   permissions: must be teacher on course
   *
   * @param {*} req
   * @param {*} res
   */
  async create(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      const teacherInsId = req.body.teacherInstanceId
      const studentInsId = req.body.studentInstanceId

      if (!req.authenticated.success) {
        res.status(400).send('You have to be authenticated to do this.')
        return
      }
      const requestMakerId = req.decoded.id
      const studentInstance = await StudentInstance.findOne({
        where: {
          id: studentInsId
        }
      })
      if (!studentInstance) {
        res.status(400).send('Specified student instance could not be found.')
        return
      }
      if (!teacherInsId) {
        studentInstance.update({
          teacherInstanceId: null
        })
        res.status(200).send(studentInstance)
        return
      }
      const requestMakerAsTeacher = await TeacherInstance.findOne({
        where: {
          userId: requestMakerId,
          courseInstanceId: studentInstance.courseInstanceId
        }
      })
      if (!requestMakerAsTeacher) {
        res.status(400).send('You have to be an assistant or teacher in the'
          + 'same course as the student you are assigning a teacher to.')
        return
      }
      const requestMakersCoursesId = requestMakerAsTeacher.courseInstanceId
      const givenTeachersTeacherInstance = await TeacherInstance.findOne({
        where: {
          id: teacherInsId
        }
      })
      if (!givenTeachersTeacherInstance) {
        res.status(400).send('There is no teacher with the given teacher instance ID.')
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
      studentInstance.update({
        teacherInstanceId: teacherInsId
      })
      res.status(200).send(studentInstance)
    } catch (e) {
      logger.error('Error when creating an assistant.', { error: e.message })
    }
  },

  /**
   * Get assistant for student instance
   *   permissions: must be teacher on course
   * currently not used by frontend, but has a call (getStudentsAssistant)
   *
   * @param {*} req
   * @param {*} res
   */
  async findAssistantByStudentInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    const returnedAssistantInfo = {
      status: undefined,
      data: undefined
    }
    let studentInstanceId

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
        const courseInstance = await CourseInstance.findOne({
          where: { id: studentInstance.courseInstanceId }
        })
        const isTeacher = await helper.getTeacherId(req.decoded.id, courseInstance.id)
        if (!isTeacher) {
          return res.status(403).send('must be teacher on the course')
        }

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
        returnedAssistantInfo.status = 'Student already has an assigned assistant.'

        res.status(200).send(returnedAssistantInfo)
      } else {
        returnedAssistantInfo.status = 'No assistant assigned to student.'
        res.status(200).send(returnedAssistantInfo)
      }
    } catch (e) {
      res.status(400).send(e)
    }
  }
}
