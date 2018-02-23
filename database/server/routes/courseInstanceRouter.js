
const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {
  app.post('/api/courses/:courseId/instances', courseInstanceController.create)
  app.put('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.update)
  app.delete('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.destroy)
  app.post('/api/courseInstance/update', courseInstanceController.getNew) //For updating DB with data from opetushallitus
  app.get('/api/instances', courseInstanceController.list)
}
