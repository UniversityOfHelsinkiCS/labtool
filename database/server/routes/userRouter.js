const usersController = require('../controllers').users

module.exports = (app) => {
  app.post('/api/users', usersController.create)
  app.get('/api/users', usersController.list)
  app.put('/api/users/update', usersController.update)
}