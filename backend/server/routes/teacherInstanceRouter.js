const teacherInstanceController = require('../controllers').teacherInstances

module.exports = (app) => {
  app.get('/api/courseinstances', courseInstanceController.list)
  //app.post('/api/teacherinstances', teacherInstanceController.create)
  //app.get('/api/teacherinstances', teacherInstanceController.list)
  //app.get('/api/teacherinstances/:id', teacherInstanceController.retrieve)
}
