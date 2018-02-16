const User = require('../models').User
const userRoutes = require('express').Router()

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

userRoutes.get('/all', (req, res) => {
  User.findAll()
    .then(user => res.status(200).send(user))
    .catch(error => res.status(400).send(error))
})

module.exports.userRoutes = userRoutes
