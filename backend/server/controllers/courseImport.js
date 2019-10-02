const helper = require('../helpers/courseImportHelper')
const logger = require('../utils/logger')

module.exports = {
  async hasPermission(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('be authenticated').end()
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
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('be authenticated').end()
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
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (!req.authenticated.success) {
      res.status(401).send('be authenticated').end()
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
