exports.tokenVerify = tokenVerify2
exports.CurrentTermAndYear = CurrentTermAndYear
exports.getCurrentTerm = getCurrentTerm
exports.getNextYear = getNextYear
exports.getNextTerm = getCurrentTerm
exports.getOpts = getOpts
exports.getCurrent = getCurrent

// This is not needed anymore and should be fixed in issue #127
function tokenVerify2(req) {
  var jwt = require('jsonwebtoken')
  return jwt.verify(req.token, process.env.SECRET, function (err, decoded) {
    if (err) {
      return {verified: false, data: null}
    } else {
      return {verified: true, data: decoded}
    }
  })

}

function CurrentTermAndYear() {
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

function getNextTerm(term) {
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


/**
 *
 * @param year
 * @param term
 * @returns {{method: string, uri: string, headers: {'Content-Type': string, Authorization: *}, strictSSL: boolean}}
 */
function getOpts(year, term) {
  return {
    method: 'get',
    uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses?year=${year}&term=${term}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.TOKEN
    },
    strictSSL: false
  }
}

/**
 * Javascript is just a stupid language.
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCurrent(req, res) {
  console.log('entered getCurrent')
  try {
    const timeMachine = CurrentTermAndYear()
    const request = require('request')
    const options = await getOpts(timeMachine.currentYear, timeMachine.currentTerm)

    async function execRequest(callback) {
      try {
        await request(options, async function (err, res, body) {
          try {
            const json = await JSON.parse(body)
            await callback(json)
            /* json.forEach(instance => {
              CourseInstance.findOrCreate({
                where: {ohid: instance.id},
                defaults: {
                  name: instance.name,
                  start: instance.starts,
                  end: instance.ends,
                  ohid: instance.id
                }
              })
            }) */
          } catch (e) {
            return e
          }
        })
      } catch (e) {
        return e
      }
    }

    const somepromise = await execRequest(async function(json){
      try {
        const new_json =  json
        return new_json
      } catch (e) {
        return "jep"
      }
    })


    return somepromise

  } catch (e) {
    console.log('errored in getCurrent')
    return e


  }
}

/**
 *
 * @param req
 * @param res
 */
function getNewer(req, res) {
  const timeMachine = CurrentTermAndYear()
  const request = require('request')

  request(getOpts(timeMachine.nextYear, timeMachine.nextTerm), function (err, resp, body) {
    const json = JSON.parse(body)
    console.log(json)
    /* json.forEach(instance => {
          CourseInstance.findOrCreate({
            where: {ohid: instance.id},
            defaults: {
              name: instance.name,
              start: instance.starts,
              end: instance.ends,
              ohid: instance.id
            }
          })
        })*/
  })
}
