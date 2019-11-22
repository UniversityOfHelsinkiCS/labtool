const Sequelize = require('sequelize')

const applicationHelpers = require('./applicationHelper')
const logger = require('../utils/logger')
const { Week, CourseInstance, StudentInstance, TeacherInstance } = require('../models')

const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.js')[env]
const db = require('../models')

exports.CurrentTermAndYear = applicationHelpers.CurrentTermAndYear
exports.getCurrentTerm = applicationHelpers.getCurrentTerm
exports.getNextYear = applicationHelpers.getNextYear
exports.getNextTerm = applicationHelpers.getNextTerm
exports.checkWebOodi = checkWebOodi
exports.findByUserStudentInstance = findByUserStudentInstance
exports.getCurrent = applicationHelpers.getCurrent
exports.controllerBeforeAuthCheckAction = applicationHelpers.controllerBeforeAuthCheckAction
exports.checkHasCommentPermission = checkHasCommentPermission
exports.getTeacherId = applicationHelpers.getTeacherId
exports.getRoleToViewStudentInstance = getRoleToViewStudentInstance
// exports.checkHasMarkCommentAsReadPermission = checkHasMarkCommentAsReadPermission

/**
 * Only used in courseInstance controller so its place is here.
 * @param req
 * @param res
 * @param user
 * @param resolve
 */
function checkWebOodi(req, res, user, resolve) {
  const options = {
    method: 'get',
    uri: `${config.kurki_url}/labtool/courses/${req.params.ohid}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    strictSSL: false
  }
  if (process.env.INCLUDE_TESTERS) {
    options.uri += '?testing=1'
  }

  console.log('request_to', `${config.kurki_url}/labtool/courses/${req.params.ohid}`)
  console.log(process.env.TOKEN)

  resolve('found')
  /*
  request(options, (req, res, body) => {
    let json = null
    console.log(body)
    try {
      json = JSON.parse(body)
    } catch (e) {
      logger.error('checkweboodi error', { error: e.message })
      resolve('notfound')
      return
    }
    if (json.students.find(student => student === user.studentNumber)) {
      resolve('found')
      return
    } else {
//      logger.info(json)
//      logger.info('course registration not found for studentNumber', user.studentNumber)
      resolve('notfound')
      return
    }
  }) */
}

/**
 * Check if teacher or correct student. Assumes auth already successful
 * @param user
 * @param weekId
 * @returns {*|Promise<T>}
 */
async function checkHasCommentPermission(userId, weekId) {
  // get actual week instance to get student instance
  const week = await Week.findOne({
    where: {
      id: weekId
    }
  })
  if (!week) {
    return false
  }

  // get student instance to check if the user is a correct student
  // and also to get a course
  const student = await StudentInstance.findOne({
    where: {
      id: week.studentInstanceId
    }
  })
  if (!student) {
    return false
  }

  // get course id to get teacher
  const course = await CourseInstance.findOne({
    where: {
      id: student.courseInstanceId
    }
  })
  if (!course) {
    return false
  }

  // check if the user is a teacher
  const teacher = await TeacherInstance.findOne({
    where: {
      userId,
      courseInstanceId: course.id
    }
  })

  // ok, user is a teacher?
  const isTeacher = !!teacher
  // ok, user is the student whose review we are trying to comment on?
  const isCorrectStudent = student && (student.userId === userId)
  return isTeacher || isCorrectStudent
}

// async function checkHasMarkCommentAsReadPermission(userId, weekId) {
//   const week = await Week.findOne({
//     where: {
//       id: weekId
//     }
//   })
//   if (!week) {
//     return false
//   }

//   const student = await StudentInstance.findOne({
//     where: {
//       id: week.studentInstanceId
//     }
//   })
//   if (!student) {
//     return false
//   }
//   const teacher = await TeacherInstance.findOne({
//     where: {
//       id: student.teacherInstanceId,
//       userId
//     }
//   })
//   return !!teacher
// }

/**
 * Checks if logged in user has permission to see student instance
 * @param {*} req
 * @param {*} courseInstanceId
 * @param {*} userId
 */
async function getRoleToViewStudentInstance(req, courseInstanceId, userId) {
  const adminTeacherInstance = await TeacherInstance.findOne({ where: {
    userId: req.decoded.id,
    courseInstanceId,
    instructor: false
  } })

  // Logged in user is teacher (not instructor) on the course
  if (adminTeacherInstance) {
    return 'teacher'
  }

  // Find student instance where logged in user is either student or assigned teacher
  const studentInstance = await StudentInstance.findOne({
    where: {
      courseInstanceId,
      userId,
      [Sequelize.Op.or]: [
        { userId: req.decoded.id },
        { '$TeacherInstance.userId$': req.decoded.id }
      ]
    },
    include: [TeacherInstance]
  })

  if (studentInstance && studentInstance.userId === req.decoded.id) {
    return 'student'
  } 
  if (studentInstance) {
    return 'assistant'
  }

  const assistantInstance = await TeacherInstance.findOne({ where: {
    userId: req.decoded.id,
    courseInstanceId
  } })

  // Logged in user is assistant on course, even for some other student
  if (assistantInstance) {
    return 'other assistant'
  }

  return null
}

/**
 *
 * @param req
 * @param res
 */
function findByUserStudentInstance(req, res) {
  // token verification might not work..? and we don't knpw if search works

  const errors = []

  if (!applicationHelpers.controllerBeforeAuthCheckAction(req, res)) {
    return
  }
  if (Number.isInteger(req.decoded.id)) {
    db.sequelize
      .query(
        `SELECT * FROM "CourseInstances" JOIN "StudentInstances" ON "CourseInstances"."id" = "StudentInstances"."courseInstanceId" WHERE "StudentInstances"."userId" = ${
          req.decoded.id
        }`
      )
      .then(instance => res.status(200).send(instance[0]))
      .catch((error) => {
        logger.error('findByUserStudentInstance error', { error: error.message })
        res.status(400).send(error)
      })
  } else {
    errors.push('\nsomething went wrong')
    res.status(400).send(errors)
  }
}
