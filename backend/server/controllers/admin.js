const helper = require('../helpers/course_instance_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  async list(req, res) {
    try {
      const out = await helper.getCurrent(req, res)
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