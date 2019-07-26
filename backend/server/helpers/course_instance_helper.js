const application_helpers = require('./application_helper')

const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]
const logger = require('../utils/logger')

exports.CurrentTermAndYear = application_helpers.CurrentTermAndYear
exports.getCurrentTerm = application_helpers.getCurrentTerm
exports.getNextYear = application_helpers.getNextYear
exports.getNextTerm = application_helpers.getNextTerm
exports.checkWebOodi = checkWebOodi
exports.findByUserStudentInstance = findByUserStudentInstance
exports.getCurrent = application_helpers.getCurrent
exports.controller_before_auth_check_action = application_helpers.controller_before_auth_check_action

/**
 * Only used in courseInstance controller so its place is here.
 * @param req
 * @param res
 * @param user
 * @param resolve
 */
function checkWebOodi(req, res, user, resolve) {
  const request = require('request')
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
 *
 * @param req
 * @param res
 */
function findByUserStudentInstance(req, res) {
  // token verification might not work..? and we don't knpw if search works

  const StudentInstanceController = require('../controllers').studentInstances
  const db = require('../models')
  const Sequelize = require('sequelize')
  const Op = Sequelize.Op

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
