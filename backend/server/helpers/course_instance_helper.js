const application_helpers = require('./application_helper')

exports.CurrentTermAndYear = application_helpers.CurrentTermAndYear
exports.getCurrentTerm = application_helpers.getCurrentTerm
exports.getNextYear = application_helpers.getNextYear
exports.getNextTerm = application_helpers.getNextTerm
exports.checkWebOodi = checkWebOodi
exports.findByUserStudentInstance = findByUserStudentInstance
exports.tokenVerify = application_helpers.tokenVerify // Should be removed in issue #127
exports.getCurrent = application_helpers.getCurrent

/**
 * Only used in courseInstance controller so its place is here.
 * @param req
 * @param res
 * @param user
 * @param resolve
 */
function checkWebOodi(req, res, user, resolve) {
  console.log('checking weboodi..')
  const auth = process.env.TOKEN || 'notset'
  if (auth == 'notset') {
    res.send('Please restart the backend with the correct TOKEN environment variable set')
  } else {
    const request = require('request')
    const options = {
      method: 'get',
      uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses/${req.params.ohid}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth
      },
      strictSSL: false
    }
    request(options, function(req, res, body) {
      const json = JSON.parse(body)
      if (json['students'].toString().match(user.studentnumber) !== null) {
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
}

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
  let token = application_helpers.tokenVerify(req)
  console.log('TOKEN VERIFIED: ', token)
  const id = parseInt(req.body.userId)
  console.log('req.params.UserId: ', id)
  if (token.verified) {
    if (Number.isInteger(token.data.id)) {
      db.sequelize
        .query(`SELECT * FROM "CourseInstances" JOIN "StudentInstances" ON "CourseInstances"."id" = "StudentInstances"."courseInstanceId" WHERE "StudentInstances"."userId" = ${token.data.id}`)
        .then(instance => res.status(200).send(instance[0]))
        .catch(error => res.status(400).send(error))
    } else {
      errors.push('something went wrong')
      res.status(400).send(errors)
    }
  } else {
    errors.push('token verification failed')
    res.status(400).send(errors)
  }
}
