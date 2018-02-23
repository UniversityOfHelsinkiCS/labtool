const courseInstanceControllerStudentsUsers = require('../controllers').courseInstancesStudentsUsers

module.exports = (app) => {
    /*app.get('/api', (req, res) => res.status(200).send({
        message: 'Welcome to the COURSES API!',
    }))*/


    app.post('/api/courseinstancestudent', courseInstanceControllerStudentsUsers.create)
    app.get('/api/courseinstancestudent', courseInstanceControllerStudentsUsers.list)
}