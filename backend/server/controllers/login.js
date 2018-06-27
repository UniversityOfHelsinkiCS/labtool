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
          let first
          const last = body.last_name
          const number = body.student_number
          console.log('\n\n\nbody: ', body, '\n\n\n')
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
              lastname: last,
              studentNumber: body.student_number,
              email: ''
            }
          }).spread((newuser, created) => {
            User.update({ firsts: first }, { where: { id: newuser.id } })
            User.update({ lastname: last }, { where: { id: newuser.id } })
            User.update({ studentNumber: number }, { where: { id: newuser.id } })

            const user = {
              id: newuser.id,
              firsts: first,
              lastname: last,
              studentNumber: number,
              email: newuser.email,
              username: newuser.username
            }
            console.log('user: ', user)

            const token = jwt.sign({ username: newuser.username, id: newuser.id }, process.env.SECRET)
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
