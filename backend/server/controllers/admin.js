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
      res.render('index', { title: 'Activate course', message: 'Not activated courses', values: out})
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
    helper.createCourse(req.body.hid)
    res.redirect('/admin')
  },



}