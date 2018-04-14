const admin = require('../controllers').admin

module.exports = (app) => {
  app.get('/admin', admin.list)
  app.post('/admin', admin.process)
}