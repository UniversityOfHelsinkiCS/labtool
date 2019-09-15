exports.CurrentTermAndYear = CurrentTermAndYear
exports.getCurrentTerm = getCurrentTerm
exports.getInactive = getInactive
exports.getActive = getActive
exports.getNextYear = getNextYear
exports.getNextTerm = getCurrentTerm
exports.controller_before_auth_check_action = controller_before_auth_check_action
exports.getCurrent = getCurrent
exports.createCourse = createCourse

const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]
const logger = require('../utils/logger')

/**
 *
 */
function controller_before_auth_check_action(req, res) {
  if (req.authenticated.success == false) {
    res.status(401).end()
  }
}

/**
 *
 * @returns {{currentYear: string, currentTerm: string, nextTerm: string, nextYear: *}}
 * @constructor
 */
function CurrentTermAndYear() {
  const date = new Date()
  const month = date.getMonth() + 1
  const currentTerm = getCurrentTerm(month)
  const year = date.getFullYear()
  const currentYear = year.toString()
  const nextYear = getNextYear(currentTerm, year)
  nextYear.toString()
  const nextTerm = getNextTerm(currentTerm)
  return { currentYear, currentTerm, nextTerm, nextYear }
}

/**
 *
 * @param month
 * @returns {string}
 */
function getCurrentTerm(month) {
  if (month >= 1 && month <= 5) {
    return 'K'
  }
  if (month >= 6 && month <= 8) {
    return 'V'
  }
  if (month >= 9 && month <= 12) {
    return 'S'
  }
}

/**
 *
 * @param currentTerm
 * @param currentYear
 * @returns {*}
 */
function getNextYear(currentTerm, currentYear) {
  if (currentTerm === 'S') {
    return currentYear + 1
  }
  return currentYear
}

/**
 *
 * @param term
 * @returns {string}
 */
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
 * @returns {{method: string, baseURL: string, headers: {'Content-Type': string, Authorization: string}, httpsAgent: "https".Agent}}
 */
function axiosBlaBla(year, term) {
  const https = require('https')
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses?year=${year}&term=${term}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 *
 * @param hid
 * @returns {{method: string, baseURL: string, headers: {'Content-Type': string, Authorization: string}, httpsAgent: "https".Agent}}
 */
function axiosCourseBla(hid) {
  const https = require('https')
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses/${hid}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    params: {
      testing: process.env.INCLUDE_TESTERS // Set the environment variable if you want to include test users from Kurki.
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getActive(req, res) {
  try {
    // const Sequelize = require('sequelize')
    const CourseInstance = require('../models').CourseInstance
    // const Op = Sequalize.Op
    const ires = await CourseInstance.findAll({
      order: [['createdAt', 'DESC']]
    })
    return ires
  } catch (e) {
    return e
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getInactive(req, res) {
  try {
    const cur = await getCurrent(req, res)
    const nxt = await getNewer(req, res)
    const newobj = await cur.concat(nxt)
    const iarr = []
    for (const blob in newobj) {
      iarr.push(newobj[blob].id)
    }
    const Sequelize = require('sequelize')
    const CourseInstance = require('../models').CourseInstance
    const Op = Sequelize.Op

    const ires = await CourseInstance.findAll({
      where: {
        ohid: { [Op.in]: iarr }
      }
    })
    const notactivated = []

    for (const i in newobj) {
      let found = 0
      for (const j in ires) {
        if (newobj[i].id == ires[j].ohid) {
          found = 1
        }
      }
      if (found == 0) {
        notactivated.push(newobj[i])
      }
    }

    return notactivated
  } catch (e) {
    return e
  }
}

/**
 *
 * @param body
 * @returns {Promise<*>}
 */
async function createCourse(body) {
  const CourseInstance = require('../models').CourseInstance
  const TeacherInstance = require('../models').TeacherInstance
  const User = require('../models').User

  const axios = require('axios')
  const options = await axiosCourseBla(body.hid)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    const new_course = await CourseInstance.build({
      name: body.cname,
      start: body.starts,
      end: body.ends,
      ohid: body.hid
    }).save()

    if (result.teachers.length > 0) {
      for (const i in result.teachers) {
        const user = await User.findOrCreate({
          where: {
            username: result.teachers[i]
          },
          defaults: {
            username: result.teachers[i],
            admin: true
          }
        })
        TeacherInstance.build({
          userId: user[0].id,
          courseInstanceId: new_course.id,
          admin: true
        }).save()
      }
    }
    return result
  } catch (error) {
    logger.error('createCourse error', { error: error.message })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getCurrent(req, res) {
  const timeMachine = CurrentTermAndYear()
  const axios = require('axios')
  const options = await axiosBlaBla(timeMachine.currentYear, timeMachine.currentTerm)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    return result
  } catch (error) {
    logger.error('getCurrent error', { error: error.message })
  }
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function getNewer(req, res) {
  const timeMachine = CurrentTermAndYear()
  const axios = require('axios')
  const options = await axiosBlaBla(timeMachine.nextYear, timeMachine.nextTerm)
  try {
    const result = await axios
      .create(options)
      .get()
      .then(barf => barf.data)
    return result
  } catch (error) {
    logger.error('getNewer error', { error: error.message })
  }
}
