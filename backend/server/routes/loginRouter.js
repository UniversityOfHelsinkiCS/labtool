const loginController = require('../controllers').login
const logoutController = require('../controllers').logout

module.exports = (app) => {
  app.post('/api/login', loginController.login)
  app.post('/api/logout', logoutController.logout)
}
