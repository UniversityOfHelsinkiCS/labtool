const helper = require('../helpers/admin_helper')
const logger = require('../utils/logger')

module.exports = {
  /**
   * This function sends data to be rendered in index.pug which renders courses not imported from Kurki
   * and courses which are already in Labtool.
   * @param req
   * @param res
   */
  async list(req, res) {
    try {
      const nonActive = await helper.getInactive(req, res)
      const areActive = await helper.getActive(req, res)
      res.render('index', {
        title: 'Import courses to Labtool from Kurki',
        message1: 'Current and upcoming courses',
        submessage1: 'Current and upcoming courses from Kurki which are not yet in Labtool database. Click Import to import course to Labtool.',
        elseMessage1: 'There are no courses in Kurki to import',
        values1: nonActive,
        message2: 'Already imported courses',
        elseMessage2: 'There are no courses in Labtool.',
        values2: areActive
      })
    } catch (e) {
      logger.error('admin page error', { error: e.message })

      res.send('errored in controllers/admin/list')
    }
  },


  /**
   *
   * @param req
   * @param res
   */
  process(req, res) {
    helper.createCourse(req.body)
    res.redirect('back') // Shorthand for req.get('referer')
  }
}
