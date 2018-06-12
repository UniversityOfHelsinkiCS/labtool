const checklistController = require('../controllers/checklists')

module.exports = app => {
  app.post('/api/checklist/create', checklistController.create)
}
