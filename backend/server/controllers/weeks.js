const Week = require('../models').Week
const helper = require('../helpers/course_instance_helper')

module.exports = {
  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  create(req, res) {
    let token = helper.tokenVerify(req)
    if (token.verified) {
      return Week
        .create({
          points: req.body.points,
          studentInstanceId: req.body.studentInstanceId,
          weekNumber: req.body.weekNumber
        })
        .then(week => res.status(201).send(week))
        .catch(error => res.status(400).send(error))
    } else {
      res.status(400).send('token verification failed')
    }
  },
  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  list(req, res) {
    return Week
      .all()
      .then(ui => res.status(200).send(ui))
      .catch(error => res.status(400).send(error))
  },
  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Model>}
   */
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
