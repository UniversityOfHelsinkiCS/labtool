const Course = require('../models').Course;
const CourseInstance = require('../models').Course_instances

module.exports = {
  create(req, res) {
    return Course
      .create({

        name: req.body.name,
        label: req.body.label
      })
      .then(todo => res.status(201).send(todo))
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    console.log('CourseInstance: ', CourseInstance)
    return Course

      .findAll({
        include: [{
          model: CourseInstance,
          as: 'course_instances'
        }]
      })
      .then(course => res.status(200).send(course))
      .catch(error => res.status(400).send(error));
  },
};
