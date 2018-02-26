const studentInstanceController = require('../controllers').studentInstances

module.exports = (app) => {
  app.post('/api/studentinstances', studentInstanceController.create)
  app.get('/api/studentinstances', studentInstanceController.list)
  app.get('/api/studentinstances/:id', studentInstanceController.retrieve)
  app.put('/api/studentinstances/:id', studentInstanceController.update)
  app.delete('/api/studentinstances/:id', studentInstanceController.destroy)
}
