const User = require('../models').User
const jwt = require('jsonwebtoken')

module.exports = {
  create(req, res) { // EI OK...
    return User
      .create({
        username: req.body.username,
        firsts: req.body.firsts,
        lastname: req.body.lastname,
        studentNumber: req.body.studentnumber,
        email: req.body.email,
        token: 'Might be done in the future currently using localStorage'
      })
      .then(user => res.status(201).send(user))
      .catch(error => res.status(400).send(error))
  },

  update(req, res) {
    return (
      jwt.verify(req.token, process.env.SECRET, function (err, decoded) {  // OK
        if (err) {
          const error = ({ error: 'token verification failed' })
          res.status(400).send(error)
        } else {
          if (!req.body.email || req.body.email.length < 1) {
            const error = ({ error: 'Email was too short... Implementing valid email check can be done here' })
            res.status(400).send(error)
          } else {
            User.update(
              { email: req.body.email },
              { where: { id: decoded.id } }
            )
              .then(
                User.findById(decoded.id)
                  .then(user => {
                    const returnedUser = {
                      email: req.body.email,
                      firsts: user.firsts,
                      lastname: user.lastname,
                      studentNumber: user.studentnumber,
                      username: user.username
                    }
                    res.status(201).send(returnedUser)
                  })
                  .catch(error => res.status(400).send(error))
              )
          }
        }
      })
    )
  },

  list(req, res) {
    return User.findAll()
      .then(user => res.status(200).send(user))
      .catch(error => res.status(400).send(error))
  }
}
