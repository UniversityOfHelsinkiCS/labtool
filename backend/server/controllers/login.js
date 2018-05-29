const jwt = require('jsonwebtoken')
const User = require('../models').User
const request = require('request')
const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  login(req, res) {
    console.log('entered login')
    const options = {
      method: 'post',
      uri: `${config.kurki_url}/login`,
      strictSSL: false,
      json: { username: req.body.username, password: req.body.password }
    }

    const result = request(options, function (err, resp, body) {
      console.log('testitulostus: ', result.response.body)
      if (err) {
        console.log('\nlogin: ', err, 'n')
      }

      if (result.response.body.username && result.response.body.error !== 'wrong credentials') {
        console.log('\n\n\nbody: ', body, '\n\n\n')
        console.log('type of studen_number: ', typeof body.student_number)
        User.findOrCreate({
          where: { username: body.username },
          defaults: {
            firsts: body.first_names,
            lastname: body.last_name,
            studentNumber: body.student_number,
            email: ''
          }
        }).spread((newuser, created) => {
          if (newuser.firsts !== body.first_names) {
            console.log('päivitetään etunimet')
            User.update({ firsts: body.first_names }, { where: { id: newuser.id } })
          }

          if (newuser.lastname !== body.last_name) {
            console.log('päivitetään sukunimi')
            User.update({ lastname: body.last_name }, { where: { id: newuser.id } })
          }

          if (newuser.studentNumber === null) {
            console.log('päivitetään opiskelijanumero')
            User.update({ studentNumber: body.student_number }, { where: { id: newuser.id } })
          }

          console.log(
            newuser.get({
              plain: true
            })
          )

          const token = jwt.sign({ username: newuser.username, id: newuser.id }, process.env.SECRET)
          const user = {
            id: newuser.id,
            email: newuser.email,
            firsts: newuser.firsts,
            lastname: newuser.lastname,
            studentNumber: newuser.studentNumber,
            username: newuser.username
          }
          res.status(200).send({
            user,
            token,
            created
          })
        })
      } else {
        res.status(401).send({
          body
        })
      }
    })
  }
}
