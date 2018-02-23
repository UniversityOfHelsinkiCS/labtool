
const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {
    app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the COURSES API!',
    }))

    app.post('/api/courses/:courseId/instances', courseInstanceController.create)
    app.put('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.update)
    app.delete(
        '/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.destroy
    )

    app.get('/api/courseinstancestudent')

}