const User = require('../models').User
const jwt = require('jsonwebtoken')

module.exports = {

  update(req, res) {
    return (
      jwt.verify(req.token, process.env.SECRET, function (err, decoded) {  // # this should be fixed in issue #127
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
                      studentNumber: user.studentNumber,
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

}
