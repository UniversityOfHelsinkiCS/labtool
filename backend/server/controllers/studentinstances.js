const StudentInstance = require('../models').StudentInstance

module.exports = {

  list(req, res) {
    return StudentInstance
      .all()
      .then(ui => res.status(200).send(ui))
      .catch(error => res.status(400).send(error))
  },

  retrieve(req, res) {
    return StudentInstance
      .findById(req.params.id, {})
      .then(studentInstance => {
        if (!studentInstance) {
          return res.status(404).send({
            message: 'Student Instance not Found',
          })
        }
        return res.status(200).send(studentInstance)
      })
      .catch(error => res.status(400).send(error))
  },
}
