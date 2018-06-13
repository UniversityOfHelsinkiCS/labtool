const tagController = require('../controllers').tags

module.exports = app => {
  app.post('/api/tags/create/', tagController.createOrUpdate)
}
