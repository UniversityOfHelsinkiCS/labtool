const helper = require('../helpers/admin_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  async list(req, res) {
    try {
      const out = await helper.getInactive(req, res)
      console.log(out)
      res.send(out)
    } catch (e) {
      console.log(e)

      res.send("errored in controllers/admin/list")
    }
  },
  /**
   *
   * @param req
   * @param res
   */
  process(req, res) {

  },



}