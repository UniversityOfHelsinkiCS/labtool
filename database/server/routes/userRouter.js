const userController = require('../controllers').users

module.exports = (app) => {
  app.post('/api/users', userController.create)
  app.get('/api/users', userController.list)
  app.put('/api/users/update', userController.update)
}