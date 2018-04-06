const Course = require('../models').Course
const CourseInstance = require('../models').CourseInstance

module.exports = {
  create(req, res) {
    return Course
      .create({

        name: req.body.name,
        label: req.body.label
      })
      .then(todo => res.status(201).send(todo))
      .catch(error => res.status(400).send(error))
  },

  retrieve(req, res) {
    return CourseInstance
      .findOne({
        where: {
          ohid: req.params.ohid
        },
      })
      .then(course => {
        if (!course) {
          return res.status(404).send({
            message: 'Course not Found',
          })
        }
        return res.status(200).send(course)
      })
      .catch(error => res.status(400).send(error))
  },

  list(req, res) {
    return Course
      .findAll({
        include: [{
          model: CourseInstance,
          as: 'courseInstances'
        }]
      })
      .then(course => res.status(200).send(course))
      .catch(error => res.status(400).send(error))
  },
  destroy(req, res) {
    return Course
      .findById(req.params.id)
      .then(course => {
        if (!course) {
          return res.status(400).send({
            message: 'course not found',
          })
        }
        return course
          .destroy()
          .then(() => res.status(204).send())
          .catch(error => res.status(400).send(error))
      })
  },
  update(req, res) {
    return Course
      .findById(req.params.id, {
        include: [{
          model: CourseInstance,
          as: 'courseInstances'
        }],
      })
      .then(course => {
        if (!course) {
          return res.status(400).send({
            message: 'Course not found!',
          })
        }
        return course
          .update({
            name: req.body.name ||  course.name,
            label: req.body.label ||  course.label
          })
          .then(() => res.status(200).send(course))
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  }
}
