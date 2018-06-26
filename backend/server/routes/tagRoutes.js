const tagController = require('../controllers').tags

module.exports = app => {
  app.post('/api/tags/create/', tagController.createOrUpdate)
  app.get('/api/tags/list/', tagController.getAll)
  app.post('/api/tags/tagStudent/', tagController.addTagToStudentInstance)
  app.post('/api/tags/remove/', tagController.remove)
  app.post('/api/tags/untagStudent/', tagController.removeTagFromStudentInstance)
}
