const { Op } = require('sequelize')
const { getTeacherId, isCourseStaff, requireCourseStaff } = require('../helpers/auth')
const { TeacherInstance, Checklist, ChecklistItem, CourseInstance, sequelize } = require('../models')
const { copyChecklists } = require('../helpers/copyChecklists')
const { isFinalReviewWeek } = require('../helpers/finalReview')
const { HttpError, badRequest, forbidden, notFound } = require('../utils/httpError')

/** How a checklist is named in messages: "week 2", "final review" or "code review". */
const checklistLabel = (course, { week, forCodeReview }) => {
  if (forCodeReview) return 'code review'
  return isFinalReviewWeek(course, Number(week)) ? 'final review' : `week ${week}`
}

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
    case 'description':
      return row[key] !== null && typeof row[key] !== 'string' ? '"description" must have a string value or be null.' : null
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
    if (typeof req.body.courseInstanceId !== 'number') {
      throw badRequest('Missing or malformed inputs.')
    }
    await requireCourseStaff(req, req.body.courseInstanceId)
    const courseInstance = await CourseInstance.findByPk(req.body.courseInstanceId)
    if (!courseInstance) {
      throw badRequest('Course not found.')
    }
    if (typeof req.body.week !== 'number' && !req.body.forCodeReview) {
      throw badRequest('Missing or malformed inputs.')
    }
    if (req.body.maxPoints < 0) {
      throw badRequest('Invalid maximum points.')
    }
    let validationError
    try {
      validationError = validateChecklist(req.body.checklist)
    } catch (e) {
      throw badRequest('Cannot parse checklist JSON.')
    }
    if (validationError) {
      throw badRequest(validationError)
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
      throw badRequest('You must supply either a "week" or a truthy "forCodeReview".')
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
          // an id that does not exist is treated like one on another checklist: a new item is created
          if (!item || item.checklistId !== result[1].dataValues.id) {
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
          description: typeof checklistItem.description === 'string' && checklistItem.description.trim()
            ? checklistItem.description.trim() : null,
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

    const label = checklistLabel(courseInstance, { week: req.body.week, forCodeReview: !('week' in req.body) })
    res.status(200).send({
      message: `Checklist saved successfully for ${label}.`,
      result: { ...result[1].dataValues, list: checklistJson },
      data: req.body
    })
  },

  /**
   * List the checklists the current user can copy: checklists with at least one item
   * on courses where the user is staff (the same courses getOne allows).
   *   permissions: any logged in user
   *
   * @param {*} req
   * @param {*} res
   */
  async getCopyable(req, res) {
    // only courses where the user is staff: students do not see the checklists of their courses
    const teacherInstances = await TeacherInstance.findAll({
      attributes: ['courseInstanceId'],
      where: { userId: req.decoded.id }
    })
    const memberOf = [...new Set(teacherInstances.map(i => i.courseInstanceId))]
    // invalid courses (#905) are not copied from
    const courseIds = (await CourseInstance.findAll({
      attributes: ['id'],
      where: { id: { [Op.in]: memberOf }, invalid: false }
    })).map(course => course.id)

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
  },

  /**
   * Copy all checklists of another course onto a course that has none yet
   *   permissions: must be a teacher or an assistant of both the course copied to and the course copied
   *   from (the same courses getCopyable offers)
   *
   * Weeks keep their numbers; a final review checklist goes to the final review of the course copied to.
   * Checklists for weeks the course does not have are skipped.
   *
   * @param {*} req
   * @param {*} res
   */
  async copyAll(req, res) {
    const { copyFrom, copyTo } = req.body
    if (typeof copyFrom !== 'number' || typeof copyTo !== 'number' || copyFrom === copyTo) {
      throw badRequest('You must supply two different courses, "copyFrom" and "copyTo".')
    }
    const [target, source] = await Promise.all([CourseInstance.findByPk(copyTo), CourseInstance.findByPk(copyFrom)])
    if (!target || !source || source.invalid) {
      throw notFound('Course not found.')
    }
    const userId = req.decoded.id
    await requireCourseStaff(req, target.id)
    // only from courses where the user is staff: students do not see the checklists of their courses
    if (!(await isCourseStaff(userId, source.id))) {
      throw forbidden('You can only copy checklists from your own courses.')
    }

    const withItems = async (courseInstanceId) => {
      const checklists = await Checklist.findAll({ where: { courseInstanceId } })
      const counts = await Promise.all(checklists.map(c => ChecklistItem.count({ where: { checklistId: c.id } })))
      return { checklists, nonEmpty: checklists.filter((_, index) => counts[index] > 0) }
    }
    const existing = await withItems(target.id)
    if (existing.nonEmpty.length > 0) {
      throw new HttpError(409, 'The course already has checklists; copy them one at a time in the checklist editor.')
    }

    const copies = []
    const skipped = []
    const { nonEmpty } = await withItems(source.id)
    nonEmpty.forEach((checklist) => {
      if (checklist.forCodeReview) {
        copies.push({ checklist, week: null })
      } else if (checklist.week > source.weekAmount) {
        // the final review of the source
        if (target.finalReview) copies.push({ checklist, week: target.weekAmount + 1 })
        else skipped.push(checklistLabel(source, checklist))
      } else if (checklist.week <= target.weekAmount) {
        copies.push({ checklist, week: checklist.week })
      } else {
        skipped.push(checklistLabel(source, checklist))
      }
    })

    // empty checklists left behind by the editor would clash with the copies
    await sequelize.transaction(async (transaction) => {
      await Checklist.destroy({ where: { id: existing.checklists.map(c => c.id) }, transaction })
      await copyChecklists(copies, target.id, { transaction })
    })

    const copied = copies.map(({ checklist, week }) => (
      checklistLabel(target, { week, forCodeReview: checklist.forCodeReview })))
    // the new checklists, in the shape getCopyable uses
    const checklists = copies.map(({ checklist, week }) => ({
      courseInstanceId: target.id,
      week: checklist.forCodeReview ? null : week,
      forCodeReview: Boolean(checklist.forCodeReview)
    }))
    return res.status(200).send({ copied, skipped, checklists })
  },

  /**
   * Get checklist for course
   *   permissions: must be staff on the course
   *
   * The 400 answers are { message, data: req.body }: the checklist editor reads data.copying.
   *
   * @param {*} req
   * @param {*} res
   */
  async getOne(req, res) {
    if ((typeof req.body.week !== 'number' && !req.body.forCodeReview)
      || typeof req.body.courseInstanceId !== 'number') {
      return res.status(400).send({
        message: 'Missing or malformed inputs.',
        data: req.body
      })
    }

    const { courseInstanceId } = req.body
    // students do not see the checklists of their courses
    if (!(await getTeacherId(req.decoded.id, courseInstanceId))) {
      throw forbidden()
    }

    const checklist = await Checklist.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      where: 'week' in req.body
        ? { courseInstanceId, week: req.body.week, forCodeReview: false }
        : { courseInstanceId, forCodeReview: true }
    })
    if (!checklist) {
      return res.status(400).send({
        message: 'No matching checklist found.',
        data: req.body
      })
    }

    const checklistJson = {}
    const checklistItems = await ChecklistItem.findAll({
      where: {
        checklistId: checklist.id
      },
      order: [['order', 'ASC']]
    })
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

    return res.status(200).send({ ...checklist.dataValues, list: checklistJson })
  }
}
