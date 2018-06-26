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

    try {
      const result = request(options, function(err, resp, body) {
        if (result.response) {
          console.log('testitulostus: ', result.response.body)
        } else {
          console.log('testitulostus: result.response.body is undefined')
        }
        if (err) {
          console.log('\nlogin: ', err, 'n')
        }

        if (result.response && result.response.body && result.response.body.username && result.response.body.error !== 'wrong credentials') {
          console.log('\n\n\nbody: ', body, '\n\n\n')
          let first
          // If first_names from Kurki contains *, use the name after that, otherwise use first name
          if (body.first_names.includes('*')) {
            first = result.response.body.first_names.split('*')[1].split(' ')[0]
          } else {
            first = result.response.body.first_names.split(' ')[0]
          }
          User.findOrCreate({
            where: { username: body.username },
            defaults: {
              firsts: first,
              lastname: body.last_name,
              studentNumber: body.student_number,
              email: ''
            }
          }).spread((newuser, created) => {
            if (newuser.firsts !== first) {
              console.log('päivitetään kutsumanimi').then(User.update({ firsts: first }, { where: { id: newuser.id } }))
            }

            if (newuser.lastname !== body.last_name) {
              console.log('päivitetään sukunimi').then(User.update({ lastname: body.last_name }, { where: { id: newuser.id } }))
            }

            if (newuser.studentNumber === null) {
              console.log('päivitetään opiskelijanumero').then(User.update({ studentNumber: body.student_number }, { where: { id: newuser.id } }))
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
    } catch (error) {
      res.status(500).send({
        error: 'Unexpected error'
      })
      console.log(error)
    }
  }
}
