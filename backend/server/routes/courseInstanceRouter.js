const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {
  app.get('/api/courseinstances', courseInstanceController.list)
  app.post('/api/courseinstances/', courseInstanceController.create)
  app.get('/api/courseinstances/:id', courseInstanceController.retrieve)
  app.put('/api/courseinstances/:id', courseInstanceController.update)
  app.delete('/api/courseinstances/:id', courseInstanceController.destroy)

  app.post('/api/courseinstances/update', courseInstanceController.getNew) //For updating DB with data from opetushallitus
}
