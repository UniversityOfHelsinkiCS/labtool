const helper = require('../helpers/course_import_helper')
const logger = require('../utils/logger')

module.exports = {
  async hasPermission(req, res) {
    helper.controller_before_auth_check_action(req, res)
    if (!req.authenticated.success) {
      res.status(401).end()
    }
    const user = req.decoded.id

    try {
      res.status(200).send({ allowed: await helper.hasPermissionToImport(user) })
    } catch (e) {
      logger.error(e)
      res.status(200).send({ allowed: false })
    }
  },

  async list(req, res) {
    helper.controller_before_auth_check_action(req, res)
    if (!req.authenticated.success) {
      res.status(401).end()
    }
    const user = req.decoded.id

    const gotPermission = await helper.hasPermissionToImport(user)
    if (!gotPermission) {
      res.status(403).send('you are not allowed to import courses')
      return
    }

    try {
      const nonActive = await helper.getInactive(req, res)
      res.status(200).send(helper.formatCoursesForList(nonActive))
    } catch (e) {
      res.status(400).send('error while listing importable courses')
    }
  },

  async import(req, res) {
    helper.controller_before_auth_check_action(req, res)
    if (!req.authenticated.success) {
      res.status(401).end()
    }
    const user = req.decoded.id

    const gotPermission = await helper.hasPermissionToImport(user)
    if (!gotPermission) {
      res.status(403).send('you are not allowed to import courses')
      return
    }

    await Promise.all(req.body.courses.map(async (course) => {
      await helper.createCourse(course)
    }))
    res.status(200).send()
  }
}
