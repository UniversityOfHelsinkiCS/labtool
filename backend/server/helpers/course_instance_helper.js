const application_helpers = require('./application_helper')

exports.CurrentTermAndYear = application_helpers.CurrentTermAndYear
exports.getCurrentTerm = application_helpers.getCurrentTerm
exports.getNextYear = application_helpers.getNextYear
exports.getNextTerm = application_helpers.getNextTerm
exports.checkWebOodi = checkWebOodi
exports.tokenVerify = application_helpers.tokenVerify  // Should be removed in issue #127
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
        'Authorization': auth
      },
      strictSSL: false
    }
    request(options, function (req, res, body) {
      const json = JSON.parse(body)
      if (json['students'].toString().match(user.studentnumber) !== null) {  // stupid javascript.. even regex match is simpler than json array that has or not has a key of whatever.
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
