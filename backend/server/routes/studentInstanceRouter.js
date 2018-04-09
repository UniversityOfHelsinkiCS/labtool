const studentInstanceController = require('../controllers').studentInstances

module.exports = (app) => {
  app.get('/api/studentinstances', studentInstanceController.list)
  app.get('/api/studentinstances/:id', studentInstanceController.retrieve)
}
