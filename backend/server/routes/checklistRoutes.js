const checklistController = require('../controllers/checklists')

module.exports = (app) => {
  /**
   * Expects a JSON body with the following fields:
   * week: number of week to associate checklist with.
   * courseInstanceId: id of course to associate checklist with.
   * checklist: JSON object to be saved as a representation of the checklist.
   */
  app.post('/api/checklist/create', checklistController.create)
  /**
   * Expects a JSON body with the following fields:
   * week: number of the week.
   * courseInstanceId: id of the course.
   */
  app.post('/api/checklist/getone', checklistController.getOne)
}
