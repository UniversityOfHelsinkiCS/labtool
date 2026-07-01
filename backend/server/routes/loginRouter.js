const loginController = require('../controllers').login
const logoutController = require('../controllers').logout

const USE_FAKE_LOGIN = process.env.USE_FAKE_LOGIN === 'ThisIsNotProduction'

module.exports = (app) => {
  app.post('/api/login', loginController.login)

  if (USE_FAKE_LOGIN) {
    app.post('/api/loginFake', loginController.loginFake)
  }

  app.post('/api/logout', logoutController.logout)
}
