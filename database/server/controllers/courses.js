const Course = require('../models').Course;
const CourseInstance = require('../models').Course_instances

module.exports = {
  create(req, res) {
    return Course
      .create({
        title: req.body.title,
        name: req.body.name
      })
      .then(todo => res.status(201).send(todo))
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return Course
      .findAll({
        include: [{
          model: CourseInstance,
          as: 'courseInstances',
        }],
        order: [
          ['createdAt', 'DESC'],
          [{model: CourseInstance, as: 'courseInstances'}, 'createdAt', 'ASC']
        ]
      })
      .then(course => res.status(200).send(course))
      .catch(error => res.status(400).send(error));
  },
};
