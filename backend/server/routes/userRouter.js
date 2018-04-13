const userController = require('../controllers').users

module.exports = (app) => {
  app.put('/api/users/update', userController.update)
}