const Week = require('../models').Week
const helper = require('../helpers/course_instance_helper')

module.exports = {
  async create(req, res) {
    try {
      let token = helper.tokenVerify(req)
      if (token.verified) {
        let week = await Week.findOne({
          where: {
            weekNumber: req.body.weekNumber,
            studentInstanceId: req.body.studentInstanceId
          }
        })

        if (week) {
          await week.update({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            comment: req.body.comment,
            weekNumber: req.body.weekNumber
          })
          res.status(200).send(week)
        } else {
          await Week.create({
            points: req.body.points,
            studentInstanceId: req.body.studentInstanceId,
            comment: req.body.comment,
            weekNumber: req.body.weekNumber
          })
          res.status(200).send(week)  
        }
        res.status(200).send
      } else {
        res.status(400).send('token verific ation failed')
      }

    } catch (error) {
      res.status(400).send(error)
    }
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
