exports.CurrentTermAndYear = CurrentTermAndYear
exports.getCurrentTerm = getCurrentTerm
exports.getInactive = getInactive
exports.getActive = getActive
exports.getNextYear = getNextYear
exports.getNextTerm = getNextTerm
exports.getCurrent = getCurrent
exports.createCourse = createCourse

const env = process.env.NODE_ENV || 'development'

const Sequelize = require('sequelize')
const NodeCache = require('node-cache')
const https = require('https')
const axios = require('axios')
const config = require('../config/config')[env]
const logger = require('../utils/logger')
const { CourseInstance, TeacherInstance, User, sequelize } = require('../models')

const { Op } = Sequelize
const cache = new NodeCache({ stdTTL: 600 }) // standard ttl is 600s

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
  const nextTerm = getNextTerm(currentTerm)
  return { currentYear, currentTerm, nextTerm, nextYear }
}

/**
 *
 * @param month
 * @returns {string}
 */
function getCurrentTerm(month) {
  if (1 <= month && month <= 5) {
    return 'K'
  } if (6 <= month && month <= 8) {
    return 'V'
  } if (9 <= month && month <= 12) {
    return 'S'
  }
  return null
}

/**
 *
 * @param currentTerm
 * @param currentYear
 * @returns {*}
 */
function getNextYear(currentTerm, currentYear) {
  return currentTerm === 'S' ? (currentYear + 1) : currentYear
}

/**
 *
 * @param term
 * @returns {string}
 */
function getNextTerm(term) {
  switch (term) {
    case 'K':
      return 'V'
    case 'V':
      return 'S'
    case 'S':
      return 'K'
    default:
      return null
  }
}

/**
 * A failed request to Kurki (the course registry / importer).
 */
class KurkiError extends Error {
  constructor(message, cause) {
    super(message)
    this.name = 'KurkiError'
    this.cause = cause
  }
}

/**
 * axios options for listing the Kurki courses of a term.
 * @param year
 * @param term
 */
function kurkiCourseListRequest(year, term) {
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    params: {
      token: process.env.TOKEN,
      year,
      term
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 * axios options for fetching one Kurki course (its teachers and students).
 * @param hid
 */
function kurkiCourseRequest(hid) {
  return {
    method: 'get',
    baseURL: `${config.kurki_url}/labtool/courses/${hid}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.TOKEN
    },
    params: {
      token: process.env.TOKEN,
      testing: process.env.INCLUDE_TESTERS // Set the environment variable if you want to include test users from Kurki.
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false // if you don't like this then please go ahead and do it yourself better.
    })
  }
}

/**
 * The response data of a Kurki request. Throws a KurkiError when the request fails.
 * @param options axios options
 */
async function fetchFromKurki(options) {
  try {
    const response = await axios.create(options).get()
    return response.data
  } catch (error) {
    logger.error('Kurki request failed', { url: options.baseURL, error: error.message })
    throw new KurkiError(`Kurki request failed: ${error.message}`, error)
  }
}

/**
 * All course instances, newest first.
 */
async function getActive() {
  return CourseInstance.findAll({
    order: [['createdAt', 'DESC']]
  })
}

// adds .instructor to Kurki courses
async function addInstructorToCourseList(course) {
  try {
    const kurkiCourse = await fetchFromKurki(kurkiCourseRequest(course.id))
    return { ...course, instructor: kurkiCourse.teachers.join('; ') }
  } catch (error) {
    // the course can be listed without its teachers
    logger.error('error getting instructor', { error: error.message })
    return { ...course, instructor: '' }
  }
}

async function getInactiveFromKurki() {
  const current = await getCurrent()
  const next = await getNewer()
  if (!Array.isArray(current) || !Array.isArray(next)) {
    throw new KurkiError('Could not fetch courses from Kurki')
  }
  const kurkiCourses = current.concat(next)
  const imported = await CourseInstance.findAll({
    attributes: ['ohid'],
    where: {
      ohid: { [Op.in]: kurkiCourses.map(course => course.id) }
    }
  })
  const importedOhids = imported.map(course => course.ohid)
  const notImported = kurkiCourses.filter(c => !importedOhids.includes(c.id))
  return Promise.all(notImported.map(addInstructorToCourseList))
}

/**
 * The Kurki courses of this and the next term that are not imported yet. They are cached for 10 minutes;
 * with refresh (when importing courses) they are fetched directly from Kurki and the cache is cleared.
 * Throws a KurkiError when Kurki cannot be reached.
 * @param refresh
 * @returns {Promise<*>}
 */
async function getInactive({ refresh = false } = {}) {
  const key = 'inactiveCourses'
  if (refresh) {
    const inactive = await getInactiveFromKurki()
    cache.del(key)
    return inactive
  }

  let inactive = cache.get(key)
  if (!inactive) {
    // only successful results are cached, so a Kurki failure is retried on the next request
    inactive = await getInactiveFromKurki()
    cache.set(key, inactive)
  }
  return inactive
}

/**
 * Imports a Kurki course and makes its Kurki teachers responsible teachers of it. Throws a KurkiError
 * when Kurki cannot be reached; the course is created only when all its teachers can be added too.
 * @param body { hid, cname, starts, ends }
 * @returns {Promise<*>} the course data from Kurki
 */
async function createCourse(body) {
  const kurkiCourse = await fetchFromKurki(kurkiCourseRequest(body.hid))
  const teachers = Array.isArray(kurkiCourse.teachers) ? kurkiCourse.teachers : []

  await sequelize.transaction(async (transaction) => {
    const newCourse = await CourseInstance.create({
      name: body.cname,
      start: body.starts,
      end: body.ends,
      ohid: body.hid
    }, { transaction })

    // Teacher records are intentionally created sequentially.
    for (const username of teachers) {
      const [user] = await User.findOrCreate({
        where: { username },
        defaults: { username, teacher: true },
        transaction
      })
      await TeacherInstance.create({
        userId: user.id,
        courseInstanceId: newCourse.id,
        instructor: false
      }, { transaction })
    }
  })
  return kurkiCourse
}

/**
 * The Kurki courses of the current term. Throws a KurkiError when Kurki cannot be reached.
 * @returns {Promise<*>}
 */
async function getCurrent() {
  const terms = CurrentTermAndYear()
  return fetchFromKurki(kurkiCourseListRequest(terms.currentYear, terms.currentTerm))
}

/**
 * The Kurki courses of the next term. Throws a KurkiError when Kurki cannot be reached.
 * @returns {Promise<*>}
 */
async function getNewer() {
  const terms = CurrentTermAndYear()
  return fetchFromKurki(kurkiCourseListRequest(terms.nextYear, terms.nextTerm))
}

// a class is not hoisted, so it is exported after its declaration
exports.KurkiError = KurkiError
