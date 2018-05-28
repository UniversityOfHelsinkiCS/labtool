const application_helpers = require('./application_helper')
const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]

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
  request(options, function(req, res, body) {
    const json = JSON.parse(body)
    console.log('\njson students to string', json['students'].toString())
    if (json['students'].toString().match(user.studentNumber) !== null) {
      // stupid javascript.. even regex match is simpler than json array that has or not has a key of whatever.
      console.log('found')
      resolve('found')
      return
    } else {
      console.log('notfound')
      resolve('notfound')
      return
    }
  })
}

/**
 *
 * @param req
 * @param res
 */
function findByUserStudentInstance(req, res) {
  //token verification might not work..? and we don't knpw if search works

  const StudentInstanceController = require('../controllers').studentInstances
  const db = require('../models')
  const Sequelize = require('sequelize')
  const Op = Sequelize.Op

  console.log('db: ', db)
  const errors = []
  console.log('searching by studentInstance...')
  console.log('***REQ BODY***: ', req.body)

  application_helpers.controller_before_auth_check_action(req, res)
  if (Number.isInteger(req.decoded.id)) {
    db.sequelize
      .query(`SELECT * FROM "CourseInstances" JOIN "StudentInstances" ON "CourseInstances"."id" = "StudentInstances"."courseInstanceId" WHERE "StudentInstances"."userId" = ${req.decoded.id}`)
      .then(instance => res.status(200).send(instance[0]))
      .catch(error => res.status(400).send(error))
  } else {
    errors.push('something went wrong')
    res.status(400).send(errors)
  }
}
