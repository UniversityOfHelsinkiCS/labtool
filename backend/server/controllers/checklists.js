const { Op } = require('sequelize')
const { enforceCurrentUserIsStudentOnCourse } = require('../helpers/auth')
const helper = require('../helpers/checklistHelper')
const { TeacherInstance, Checklist, ChecklistItem, StudentInstance, CourseInstance } = require('../models')
const logger = require('../utils/logger')

function validateChecklistRowKey(row, key) {
  switch (key) {
    case 'id':
    case 'name':
    case 'checkedPoints':
    case 'uncheckedPoints':
      return null
    case 'textWhenOn':
      return typeof row[key] !== 'string' ? '"textWhenOn" must have a string value or be undefined.' : null
    case 'textWhenOff':
      return typeof row[key] !== 'string' ? '"textWhenOff" must have a string value or be undefined.' : null
    case 'minimumRequirement':
      return typeof row[key] !== 'boolean' ? '"minimumRequirement" must be a boolean' : null
    case 'minimumRequirementMetIf':
      return typeof row[key] !== 'boolean' ? '"minimumRequirementMetIf" must be a boolean' : null
    case 'minimumRequirementGradePenalty':
      if (row.minimumRequirement && (typeof row[key] !== 'number' || !Number.isInteger(row[key]) || row[key] < 0)) {
        return '"minimumRequirementGradePenalty" must be a non-negative integer'
      }
      return null
    case 'tempId':
      // only used to map prerequisites to new checklist items, will not be stored
      return null
    case 'order':
      // ignore, because we will
      return null
    case 'prerequisite':
      return null
    default:
      return `Found unexpected key: ${key}`
  }
}

function validateChecklistRow(row) {
  if (row.id !== undefined && typeof row.id !== 'number') {
    return 'Field ID must be numeric.'
  }
  if (typeof row.name !== 'string') {
    return 'All objects in array must have field "name" with string value.'
  }
  if (typeof row.checkedPoints !== 'number') {
    return 'All objects in array must have field "points when checked" with number value.'
  }
  if (typeof row.uncheckedPoints !== 'number') {
    return 'All objects in array must have field "points when unchecked" with number value.'
  }
  for (const key of Object.keys(row)) {
    const error = validateChecklistRowKey(row, key)
    if (error) {
      return error
    }
  }
  return null
}

/**
 * Validates the checklist JSON sent by the client.
 * Returns the first validation error message, or null if the checklist is valid.
 * Throws if the checklist is not an object.
 *
 * @param {*} checklist
 */
function validateChecklist(checklist) {
  for (const category of Object.keys(checklist)) {
    if (!Array.isArray(checklist[category])) {
      return 'Supplied JSON should be an object with strings as keys and arrays as values.'
    }
    for (const row of checklist[category]) {
      const error = validateChecklistRow(row)
      if (error) {
        return error
      }
    }
  }
  return null
}

module.exports = {
  /**
   * Create/edit checklist for course
   *   permissions: must be an instructor on course
   *
   * @param {*} req
   * @param {*} res
   */
  async create(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (!req.authenticated.success) {
        return res.status(403).send('You have to be authenticated to do this.')
      }
      const teacherInstance = await TeacherInstance.findOne({
        attributes: ['id'],
        where: {
          userId: req.decoded.id,
          courseInstanceId: req.body.courseInstanceId
        }
      })
      if (!teacherInstance) {
        return res.status(403).send('You must be a teacher of the course to perform this action.')
      }
      const courseInstance = await CourseInstance.findOne({
        where: {
          id: req.body.courseInstanceId
        }
      })
      if (!courseInstance) {
        return res.status(400).send('Course not found.')
      }
      if ((typeof req.body.week !== 'number' && !req.body.forCodeReview) || typeof req.body.courseInstanceId !== 'number') {
        return res.status(400).send('Missing or malformed inputs.')
      }
      if (req.body.maxPoints < 0) {
        return res.status(400).send('Invalid maximum points.')
      }
      let validationError
      try {
        validationError = validateChecklist(req.body.checklist)
      } catch (e) {
        return res.status(400).send('Cannot parse checklist JSON.')
      }
      if (validationError) {
        return res.status(400).send(validationError)
      }
      // No validation is done to prevent creating a checklist for a week that doesn't exist.
      // Arguably, this is a feature, since the number of weeks can change.
      let result
      if ('week' in req.body) {
        result = await Checklist.findOrCreate({ where: {
          week: req.body.week,
          forCodeReview: false,
          courseInstanceId: req.body.courseInstanceId
        } })
      } else if ('forCodeReview' in req.body && req.body.forCodeReview) {
        result = await Checklist.findOrCreate({ where: {
          forCodeReview: true,
          courseInstanceId: req.body.courseInstanceId
        } })
      } else {
        return res.status(400).send('You must supply either a "week" or a truthy "forCodeReview".')
      }
      // Update maxPoints. This cannot be done with findOrCreate as by default courses have null as maxPoints
      result = await Checklist.update(
        { maxPoints: req.body.maxPoints },
        { where: { id: result[0].dataValues.id }, returning: true, plain: true }
      )

      const checklistJson = {}
      const checklistIdsNow = []
      let checklistOrder = 1

      // we will remove prerequisites for now and put them onto a map
      // also we need to map tempId => true id
      const prerequisites = {}
      const tempIdMap = {}
      const prerequisitesRemove = []

      for (const category in req.body.checklist) {
        const checklistForCategory = req.body.checklist[category]

        // Categories are processed sequentially so checklistOrder remains deterministic.
        // eslint-disable-next-line no-await-in-loop
        const checklistForCategoryIdFiltered = await Promise.all(checklistForCategory.map(async (checklistItem) => {
          // if the ID conflicts with an existing checklist item
          // *on another checklist*, remove ID here. this makes
          // copying a lot easier, since it won't overwrite the
          // checklist items on another week/course

          const checklistItemCopy = { ...checklistItem }
          if (checklistItemCopy.id) {
            const item = await ChecklistItem.findOne({
              attributes: ['checklistId'],
              where: {
                id: checklistItemCopy.id
              }
            })
            if (item.checklistId !== result[1].dataValues.id) {
              prerequisitesRemove.push(checklistItemCopy.id)
              delete checklistItemCopy.id
            }
          }
          return checklistItemCopy
        }))

        const categoryStartOrder = checklistOrder
        const checklistUpsert = checklistForCategoryIdFiltered.map((checklistItem, index) => {
          const obj = {
            id: checklistItem.id,
            name: checklistItem.name,
            textWhenOn: checklistItem.textWhenOn,
            textWhenOff: checklistItem.textWhenOff,
            checkedPoints: checklistItem.checkedPoints,
            uncheckedPoints: checklistItem.uncheckedPoints,
            category,
            checklistId: result[1].dataValues.id,
            order: categoryStartOrder + index, // ignore order sent by client
            prerequisite: null, // map later; see below
            minimumRequirement: checklistItem.minimumRequirement,
            minimumRequirementMetIf: checklistItem.minimumRequirementMetIf,
            minimumRequirementGradePenalty: checklistItem.minimumRequirementGradePenalty
          }
          if (obj.id === undefined) {
            delete obj.id
          }
          return obj
        })

        // eslint-disable-next-line no-await-in-loop
        const checklistItems = await Promise.all(checklistUpsert.map(async checklistItem => (checklistItem.id === undefined ? [await ChecklistItem.create(checklistItem, { returning: true })] : ChecklistItem.upsert(checklistItem, { returning: true }))))
        const zipped = checklistForCategoryIdFiltered.map((item, index) => [item, checklistItems[index][0]])

        // if we had a temp ID, map those, and if we had prerequisites, map those too
        zipped.forEach(([oldItem, newItem]) => {
          if (oldItem.tempId) {
            tempIdMap[oldItem.tempId] = newItem.id
          }
          if (oldItem.prerequisite !== null && !prerequisitesRemove.includes(oldItem.prerequisite)) {
            prerequisites[newItem.id] = oldItem.prerequisite
          }
        })

        checklistJson[category] = checklistItems.map((item) => {
          const checklistItem = item[0].dataValues
          const checklistItemCopy = { ...checklistItem }
          checklistIdsNow.push(checklistItemCopy.id)
          delete checklistItemCopy.category
          delete checklistItemCopy.checklistId
          return checklistItemCopy
        })

        checklistOrder += checklistItems.length
      }

      // remove the other stuff that we do not want
      const checklistWeekItems = await ChecklistItem.findAll({
        where: {
          checklistId: result[1].dataValues.id
        }
      })
      await Promise.all(checklistWeekItems.filter(item => !checklistIdsNow.includes(item.id)).map(item => item.destroy()))

      // handle prerequisites
      await Promise.all(Object.keys(prerequisites).map(async (newId) => {
        const prerequisiteRaw = prerequisites[newId]
        // convert possible temp ID to actual ID
        const prerequisiteActual = prerequisiteRaw in tempIdMap ? tempIdMap[prerequisiteRaw] : prerequisiteRaw

        await ChecklistItem.update(
          { prerequisite: prerequisiteActual },
          { where: { id: newId } }
        )
      }))

      res.status(200).send({
        message: `Checklist saved successfully for ${'week' in req.body ? (courseInstance.finalReview && Number(req.body.week) > courseInstance.weekAmount ? 'final review' : `week ${req.body.week}`) : 'code review'}.`,
        result: { ...result[1].dataValues, list: checklistJson },
        data: req.body
      })
    } catch (e) {
      console.error(e)
      logger.error('Checklist creation error.', { error: e.message })
      res.status(500).send('Unexpected error. Please try again.')
    }
  },

  /**
   * List the checklists the current user can copy: checklists with at least one item
   * on courses where the user is a teacher or a student (the same courses getOne allows).
   *   permissions: any logged in user
   *
   * @param {*} req
   * @param {*} res
   */
  async getCopyable(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }
    try {

      const where = { userId: req.decoded.id }
      const [teacherInstances, studentInstances] = await Promise.all([
        TeacherInstance.findAll({ attributes: ['courseInstanceId'], where }),
        StudentInstance.findAll({ attributes: ['courseInstanceId'], where })
      ])
      const courseIds = [...new Set([...teacherInstances, ...studentInstances].map(i => i.courseInstanceId))]

      const checklists = await Checklist.findAll({
        attributes: ['id', 'courseInstanceId', 'week', 'forCodeReview'],
        where: { courseInstanceId: { [Op.in]: courseIds } }
      })
      const items = await ChecklistItem.findAll({
        attributes: ['checklistId'],
        where: { checklistId: { [Op.in]: checklists.map(c => c.id) } }
      })
      const withItems = new Set(items.map(item => item.checklistId))

      res.status(200).send(checklists
        .filter(c => withItems.has(c.id))
        .map(({ courseInstanceId, week, forCodeReview }) => ({ courseInstanceId, week, forCodeReview })))
    } catch (e) {
      logger.error('Get copyable checklists error.', { error: e.message })
      res.status(500).send('Internal server error')
    }
  },

  /**
   * Get checklist for course
   *   permissions: must be instructor or student on course
   *
   * @param {*} req
   * @param {*} res
   */
  async getOne(req, res) {
    try {
      if (!req.authenticated.success) {
        return res.status(403).send('You have to be authenticated to do this.')
      }

      if ((typeof req.body.week !== 'number' && !req.body.forCodeReview) || typeof req.body.courseInstanceId !== 'number') {
        res.status(400).send({
          message: 'Missing or malformed inputs.',
          data: req.body
        })
        return
      }

      const courseInstanceId = req.body.courseInstanceId

      const isTeacher = await helper.getTeacherId(req.decoded.id, req.body.courseInstanceId)
      if (!isTeacher) {
        const currentUserStudentInstance = await enforceCurrentUserIsStudentOnCourse(req, res, courseInstanceId)
        if (!currentUserStudentInstance) return
      }


      const checklist = 'week' in req.body ? await Checklist.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          courseInstanceId,
          week: req.body.week,
          forCodeReview: false
        }
      }) : await Checklist.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          courseInstanceId,
          forCodeReview: true
        }
      })

      if (checklist) {
        const checklistJson = {}
        const checklistItems = await ChecklistItem.findAll({ where: {
          checklistId: checklist.id
        },
        order: [['order', 'ASC']] })
        checklistItems.forEach(({ dataValues: checklistItem }) => {
          if (checklistJson[checklistItem.category] === undefined) {
            checklistJson[checklistItem.category] = []
          }

          const checklistItemCopy = { ...checklistItem }
          delete checklistItemCopy.category
          delete checklistItemCopy.checklistId
          if (req.body.copying) {
            // tempId is the id of the checklist item we copied; it's used
            // to map prerequisites, etc.
            checklistItemCopy.tempId = checklistItemCopy.id
            delete checklistItemCopy.id
          }
          checklistJson[checklistItem.category].push(checklistItemCopy)
        })

        res.status(200).send({ ...checklist.dataValues, list: checklistJson })
      } else {
        res.status(400).send({
          message: 'No matching checklist found.',
          data: req.body
        })
      }
    } catch (e) {
      logger.error('Get checklist error.', { error: e.message })
      res.status(500).send('Internal server error')
    }
  }
}
