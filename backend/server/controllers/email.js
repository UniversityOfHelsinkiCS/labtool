const helper = require('../helpers/email_helper')

module.exports = {
  async send(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      res.status(200).send('success')
    } catch (e) {
      res.status(500).send('Unexpected error')
    }
  }
}
