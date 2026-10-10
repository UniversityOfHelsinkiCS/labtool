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
  /**
   * Lists { courseInstanceId, week, forCodeReview } of the non-empty checklists on the current
   * user's courses, i.e. the checklists that can be copied with getone.
   */
  app.get('/api/checklist/copyable', checklistController.getCopyable)
}
