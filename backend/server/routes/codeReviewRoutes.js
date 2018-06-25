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
  /**
   * Expects the following fields in the body:
   * reviewNumber: reviewNumber of codeReview to update.
   * studentInstanceId: studentInstance whose codeReview to update.
   * points: value to which points should be updated.
   */
  app.put('/api/codereviews/grade', codeReviewController.grade)
  /**
   * Expects the following fields in the body:
   * reviewNumber: reviewNumber of codeReview to update.
   * studentInstanceId: studentInstance whose codeReview to update.
   * linkToReview: link to insert.
   */
  app.put('/api/codereviews/link', codeReviewController.addLink)
}
