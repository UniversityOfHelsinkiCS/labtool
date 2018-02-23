
const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {
<<<<<<< HEAD
    app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the COURSES API!',
    }))

    app.post('/api/courses/:courseId/instances', courseInstanceController.create)
    app.put('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.update)
    app.delete(
        '/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.destroy
    )

    app.get('/api/courseinstancestudent')

=======
  app.post('/api/courses/:courseId/instances', courseInstanceController.create)
  app.put('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.update)
  app.delete('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.destroy)
>>>>>>> 4518194e4b34e80b0cacd8e394b5ff5dfa0b8eeb
}