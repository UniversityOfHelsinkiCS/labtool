const Week = require('../models').Week
const helper = require('../helpers/course_instance_helper')

module.exports = {
  create(req, res) {
    let token = helper.tokenVerify(req)
    if (token.verified) {
      Week
        .findOne({
          where: {
            weekNumber: req.body.weekNumber
          }
        })
        .then(week => {
          if (week) {
            return week.update({
              points: req.body.points,
              studentInstanceId: req.body.studentInstanceId,
              comment: req.body.comment,
              weekNumber: req.body.weekNumber
            })
              .then(res.status(201).send(week))   
              .catch(error => res.status(400).send(error))         
          } else {
            return Week.create({
              points: req.body.points,
              studentInstanceId: req.body.studentInstanceId,
              comment: req.body.comment,
              weekNumber: req.body.weekNumber
            })
              .then(res.status(201).send(week))
              .catch(error => res.status(400).send(error))  
          }          
        })
        .catch(error => res.status(400).send(error))
    } else {
      res.status(400).send('token verification failed')
    }
    res.status(400).send('async die')
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
