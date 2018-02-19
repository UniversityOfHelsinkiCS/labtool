const User = require('../models').User
const userRoutes = require('express').Router()
const jwt = require('jsonwebtoken')

userRoutes.post('/', (req, res) => {
  User
    .create({
      username: req.body.username,
      firsts: req.body.firsts,
      lastname: req.body.lastname,
      studentnumber: req.body.studentnumber,
      email: req.body.email
    })
    .then(user => res.status(201).send(user))
    .catch(error => res.status(400).send(error))
})

userRoutes.put('/update', (req, res) => {
  jwt.verify(req.token, process.env.SECRET, function (err, decoded) {
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
          .then(user => res.status(201).send(user))
          .catch(error => res.status(400).send(error))
      }
    }    
  })
})

userRoutes.get('/all', (req, res) => {
  User.findAll()
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error))
})

module.exports.userRoutes = userRoutes
