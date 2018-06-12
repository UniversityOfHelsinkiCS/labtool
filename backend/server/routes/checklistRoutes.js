const checklistController = require('../controllers/checklists')

module.exports = app => {
  app.post('/api/checklist/create', checklistController.create)
  app.post('/api/checklist/getone', checklistController.getOne)
}
