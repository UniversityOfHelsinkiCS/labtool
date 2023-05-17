const userController = require('../controllers').users

module.exports = (app) => {
  app.get('/api/users', userController.list)
  app.put('/api/users/update', userController.updateSelf)
  app.put('/api/users/updateAdmin', userController.updateAdmin)
  app.post('/api/users/teacher/create', userController.createTeacher)
  app.post('/api/users/teacher/remove', userController.removeTeacher)
  app.post('/api/users/student/remove', userController.removeStudent)
}
