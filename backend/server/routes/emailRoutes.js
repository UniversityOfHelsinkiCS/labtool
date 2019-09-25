const emailController = require('../controllers/email')

module.exports = (app) => {
  /**
   * Expects request body to be JSON with the following fields.
   * commentId or weekId: id of comment/feedback to notify about. Do not supply both.
   */
  app.post('/api/email/send', emailController.send)
  app.post('/api/email/sendmass/:id', emailController.sendMass)
}
