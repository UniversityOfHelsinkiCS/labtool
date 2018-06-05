const codeReviewController = require('../controllers').codeReviews

module.exports = app => {
  /**
   * Expects the following fields in the body:
   * reviewNumber: reviewNumber to insert
   * codeReviews: Array of objects with the following fields:
   *   reviewer: will become the studentInstanceId to insert
   *   toReview: will become the toReview to insert
   */
  app.put('/api/codereviews/bulkinsert', codeReviewController.bulkInsert)
}
