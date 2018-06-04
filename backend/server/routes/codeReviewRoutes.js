const codeReviewController = require('../controllers').codeReviews

module.exports = app => {
  app.post('/api/codereviews/bulkinsert', codeReviewController.bulkInsert)
}
