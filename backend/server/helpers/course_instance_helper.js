const application_helpers = require('./application_helper')
const logger = require('../utils/logger')
const { Week, CourseInstance, StudentInstance, TeacherInstance } = require('../models')

const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]
const db = require('../models')

exports.CurrentTermAndYear = application_helpers.CurrentTermAndYear
exports.getCurrentTerm = application_helpers.getCurrentTerm
exports.getNextYear = application_helpers.getNextYear
exports.getNextTerm = application_helpers.getNextTerm
exports.checkWebOodi = checkWebOodi
exports.findByUserStudentInstance = findByUserStudentInstance
exports.getCurrent = application_helpers.getCurrent
exports.controller_before_auth_check_action = application_helpers.controller_before_auth_check_action
exports.checkHasCommentPermission = checkHasCommentPermission
exports.getTeacherId = application_helpers.getTeacherId

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
async function checkHasCommentPermission(user, weekId) {
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
      userId: user.id,
      courseInstanceId: course.id
    }
  })

  // ok, user is a teacher?
  const isTeacher = !!teacher
  // ok, user is the student whose review we are trying to comment on?
  const isCorrectStudent = student && (student.userId === user.id)
  return isTeacher || isCorrectStudent
}

/**
 *
 * @param req
 * @param res
 */
function findByUserStudentInstance(req, res) {
  // token verification might not work..? and we don't knpw if search works

  const errors = []

  application_helpers.controller_before_auth_check_action(req, res)
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
