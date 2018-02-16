const coursesController = require('../controllers').courses;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the COURSES API!',
  }));

  app.post('/api/courses', coursesController.create);
  app.get('/api/courses', coursesController.list);
};