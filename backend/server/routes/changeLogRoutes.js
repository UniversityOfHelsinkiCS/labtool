const changeLog = require('../controllers/changeLog')

module.exports = (app) => {
  /**
   * Change history of a student's grading and repository link (#1129, #1132), for course staff.
   */
  app.get('/api/changelog/:studentInstanceId', changeLog.listForStudent)
}
