const weekController = require('../controllers').week

module.exports = (app) => {
    app.post('/api/weeks', weekController.create)
    app.get('/api/weeks', weekController.list)
    app.get('/api/weeks/:id', weekController.retrieve)
}
