const helper = require('../helpers/courseImportHelper')
const logger = require('../utils/logger')

module.exports = {
  /**
   * Check if user has permission to import courses.
   *   permissions: any logged in user
   *
   * @param {*} req
   * @param {*} res
   */
  async hasPermission(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('You must be authenticated.').end()
    }
    const user = req.decoded.id

    try {
      res.status(200).send({ allowed: await helper.hasPermissionToImport(user) })
    } catch (e) {
      logger.error(e)
      res.status(200).send({ allowed: false })
    }
  },

  /**
   * List importable courses.
   *   permissions: any logged in user that is allowed to import courses
   *
   * @param {*} req
   * @param {*} res
   */
  async list(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('You must be authenticated.').end()
    }
    const user = req.decoded.id

    const gotPermission = await helper.hasPermissionToImport(user)
    if (!gotPermission) {
      res.status(403).send('You are not allowed to import courses.')
      return
    }

    try {
      const nonActive = await helper.getInactive(req, res)
      res.status(200).send(helper.formatCoursesForList(nonActive))
    } catch (e) {
      res.status(400).send('Error while listing importable courses.')
    }
  },

  /**
   * Import N courses.
   *   permissions: any logged in user that is allowed to import courses
   *
   * @param {*} req
   * @param {*} res
   */
  async import(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('You must be authenticated.').end()
    }
    const user = req.decoded.id

    const gotPermission = await helper.hasPermissionToImport(user)
    if (!gotPermission) {
      res.status(403).send('You are not allowed to import courses.')
      return
    }

    const nonActive = await helper.getInactive(req, res)
    await Promise.all(req.body.courses.map(async (course) => {
      if (nonActive.find(c => c.id === course.hid)) {
        await helper.createCourse(course)
      }
    }))
    res.status(200).send()
  }
}
