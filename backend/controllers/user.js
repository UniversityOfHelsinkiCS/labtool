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
  console.log('tadaa')
  jwt.verify(req.token, process.env.SECRET, function (err, decoded) {
    if (err) {
      console.log(err)
      return ({ error: 'token verification failed' })
    } else {
      console.log(decoded)
      console.log(decoded.id)
      console.log(decoded.username)
      return decoded
    }
  })
})

userRoutes.get('/all', (req, res) => {
  User.findAll()
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error))
})

module.exports.userRoutes = userRoutes
