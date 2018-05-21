const jwt = require('jsonwebtoken')
const User = require('../models').User
const request = require('request')

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
      uri: `${process.env.KURKI_URL}/login`,
      strictSSL: false,
      json: { username: req.body.username, password: req.body.password }
    }

    const result = request(options, function(err, resp, body) {
      console.log('testitulostus: ', result.response.body)
      if (err) {
        console.log(err)
      }

      if (result.response.body.username && result.response.body.error !== 'wrong credentials') {
        User.findOrCreate({
          where: { username: body.username },
          defaults: {
            firsts: body.first_names,
            lastname: body.last_name,
            studentNumber: body.student_number,
            email: ''
          }
        }).spread((newuser, created) => {
          if (!(newuser.firsts === body.first_names && newuser.lastname === body.last_name)) {
            User.update({ firsts: body.first_names, lastname: body.last_name }, { where: { id: newuser.id } })
          }

          // ^ SIDENOTE HERE: There can be a situation where the user has not a studentnumber but later gets it.

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
