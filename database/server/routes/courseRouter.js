const coursesController = require('../controllers').courses

module.exports = (app) => {
  app.post('/api/courses', coursesController.create)
  app.get('/api/courses', coursesController.list)
  app.get('/api/courses/:courseId', coursesController.retrieve)
  app.delete('/api/courses/:courseId', coursesController.destroy)
  app.put('/api/courses/:courseId', coursesController.update)
}
