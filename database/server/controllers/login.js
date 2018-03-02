const jwt = require('jsonwebtoken')
const User = require('../models').User
const request = require('request')

module.exports = {
  login(req, res) {
    //console.log('req.body saa: ', req.body)
    const options = {
      method: 'post',
      uri: 'https://opetushallinto.cs.helsinki.fi/login',
      strictSSL: false,
      json: { 'username': req.body.username, 'password': req.body.password }
    }

    const result = request(options, function (err, resp, body) {
      if (err) {
        console.log(err)
      }
      console.log('diu diu ', result.response.body)
      //console.log('öyh öyh ', result.respone.body)

      if (result.response.body.username) {
        User
          .findOrCreate({
            where: { username: body.username },
            defaults: {
              firsts: body.first_names,
              lastname: body.last_name,
              studentnumber: body.student_number,
              email: ''
            }
          })
          .spread((user, created) => {

            if (!(user.firsts === body.first_names && user.lastname === body.last_name)) {
              User.update(
                { firsts: body.first_names, lastname: body.last_name },
                { where: { id: user.id } }
              )
            }

            console.log(user.get({
              plain: true
            }))

            const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
            const returnedUser = {
              email: user.email,
              firsts: user.firsts,
              lastname: user.lastname,
              studentnumber: user.studentnumber,
              username: user.username
            }
            res.status(200).send({
              returnedUser,
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
