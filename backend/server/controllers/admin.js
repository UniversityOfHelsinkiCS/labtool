const helper = require('../helpers/admin_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  async list(req, res) {
    try {
      const nonActive = await helper.getInactive(req, res)
      //const areActive = await helper.getActive(req, res)
      //console.log('-------EI-AKTIIVISET--------')
      console.log(nonActive)
      res.render('index', { 
        title: 'Import course to Labtool from Kurki', 
        message1: 'Current and upcoming courses', 
        submessage1: 'This page lists current and upcoming courses from Kurki which are not yet in Labtool database. Click Import to import course to Labtool.',
        values1: nonActive
      })
    } catch (e) {
      console.log(e)

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
    res.redirect('/admin')
  }
}
