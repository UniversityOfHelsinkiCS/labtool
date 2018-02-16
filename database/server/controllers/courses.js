const Course = require('../models').course;

module.exports = {
  create(req, res) {
    return Course
      .create({
        title: req.body.title,
      })
      .then(todo => res.status(201).send(todo))
      .catch(error => res.status(400).send(error));
  },
  list(req, res) {
    return Course
      .all()
      .then(course => res.status(200).send(course))
      .catch(error => res.status(400).send(error));
  },
};
