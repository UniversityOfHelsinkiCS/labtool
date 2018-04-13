const Week = require('../models').Week

module.exports = {
  create(req, res) {
    return Week
      .create({
        points: req.body.points,
        studentInstanceId: req.body.studentInstanceId,
        comment: req.body.comment,
        weekNumber: req.body.weekNumber
      })
      .then(week => res.status(201).send(week))
      .catch(error => res.status(400).send(error))
  },
  list(req, res) {
    return Week
      .all()
      .then(ui => res.status(200).send(ui))
      .catch(error => res.status(400).send(error))
  },
  retrieve(req, res) {
    return Week
      .findById(req.params.id, {})
      .then(week => {
        if (!week) {
          return res.status(404).send({
            message: 'Teacher Instance not Found',
          })
        }
        return res.status(200).send(week)
      })
      .catch(error => res.status(400).send(error))
  },
}
