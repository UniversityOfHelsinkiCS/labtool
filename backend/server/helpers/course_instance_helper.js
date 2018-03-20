const application_helpers = require('./application_helper')

exports.CurrentTermAndYear = CurrentTermAndYear
exports.getCurrentTerm = getCurrentTerm
exports.getNextYear = getNextYear
exports.getNextTerm = getNextTerm
exports.checkWebOodi = checkWebOodi
exports.tokenVerify = application_helpers.tokenVerify



function CurrentTermAndYear()  {
  const date = new Date()
  const month = date.getMonth() + 1
  const currentTerm = getCurrentTerm(month)
  var year = date.getFullYear()
  console.log('month is: ', month)
  console.log('date: ', date)
  if (month >= 11) {
    year = year + 1
  }
  const currentYear = year.toString()
  var nextYear = getNextYear(currentTerm, year)
  nextYear.toString()
  const nextTerm = getNextTerm(currentTerm)
  console.log('year: ', year)
  return {currentYear, currentTerm, nextTerm, nextYear}
}

function getCurrentTerm(month) {
  if (1 <= month <= 5) {
    return 'K'
  }
  if (6 <= month <= 8) {
    return 'V'
  }
  if (9 <= month <= 12) {
    return 'S'
  }
}

function getNextYear(currentTerm, currentYear) {
  if (currentTerm === 'S') {
    return currentYear + 1
  } else {
    return currentYear
  }
}

function getNextTerm(term){
  if (term === 'K') {
    return 'V'
  }
  if (term === 'V') {
    return 'S'
  }
  if (term === 'S') {
    return 'K'
  }
}
function checkWebOodi(req, res, user) {
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
    request(options, function (err, resp, body) {
      const json = JSON.parse(body)
      console.log('json palautta...')
      console.log(json)
      let found
      if (json['students'][user.studentnumber]) {
        console.log('found')
        found = true
      } else {
        console.log('notfound')
        found = false
      }
      return found
    })
  }
}
