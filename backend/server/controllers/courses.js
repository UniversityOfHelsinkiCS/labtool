const Course = require('../models').Course
const CourseInstance = require('../models').CourseInstance

module.exports = {

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
}
