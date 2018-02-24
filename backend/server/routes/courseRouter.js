const coursesController = require('../controllers').courses

module.exports = (app) => {
    app.post('/api/courses', coursesController.create)
    app.get('/api/courses', coursesController.list)
    app.get('/api/courses/:id', coursesController.retrieve)
    app.delete('/api/courses/:id', coursesController.destroy)
    app.put('/api/courses/:id', coursesController.update)
}
