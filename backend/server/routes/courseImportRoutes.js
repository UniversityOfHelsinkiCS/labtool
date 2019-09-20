const courseImportController = require('../controllers').courseImport

module.exports = (app) => {
  app.get('/api/courseimport/allowed', courseImportController.hasPermission)
  app.get('/api/courseimport/get', courseImportController.list)
  app.post('/api/courseimport/import', courseImportController.import)
}
