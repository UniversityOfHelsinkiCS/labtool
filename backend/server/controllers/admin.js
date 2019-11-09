const helper = require('../helpers/adminHelper')
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
      res.send('You have logged in as a backend admin. Sadly there is nothing here.')
    } catch (e) {
      logger.error('admin page error', { error: e.message })

      res.send('Error in controllers/admin/list.') // More helpful!
    }
  },


  /**
   *
   * @param req
   * @param res
   */
  process(req, res) {
    res.redirect('back') // Shorthand for req.get('referer')
  }
}
