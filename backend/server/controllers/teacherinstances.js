const TeacherInstance = require('../models').TeacherInstance

module.exports = {
  create(req, res) {
    return TeacherInstance
      .create({
        userId: req.body.userId,
        courseInstanceId: req.body.courseInstanceId
      })
      .then(teacherInstance => res.status(201).send(teacherInstance))
      .catch(error => res.status(400).send(error))
  },
  list(req, res) {
    return TeacherInstance
      .all()
      .then(ui => res.status(200).send(ui))
      .catch(error => res.status(400).send(error))
  },
  retrieve(req, res) {
    return TeacherInstance
      .findById(req.params.id, {})
      .then(teacherInstance => {
        if (!teacherInstance) {
          return res.status(404).send({
            message: 'Teacher Instance not Found',
          })
        }
        return res.status(200).send(teacherInstance)
      })
      .catch(error => res.status(400).send(error))
  },
}
