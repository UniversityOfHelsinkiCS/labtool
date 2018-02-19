const coursesController = require('../controllers').courses
const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {
    app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the COURSES API!',
    }))
    /*
      app.post('/api/courses', coursesController.create)
      app.get('/api/courses', coursesController.list)
      app.get('/api/courses/:courseId', coursesController.retrieve)
    
      app.post('/api/courses/:courseId/instances', courseInstanceController.create)
    
    
      app.delete('/api/courses/:courseId', coursesController.destroy)
    
      app.put('/api/courses/:courseId', coursesController.update)
    
      app.put('/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.update)
    
      app.delete(
        '/api/courses/:courseId/instances/:courseInstanceId', courseInstanceController.destroy
      )
      */
}