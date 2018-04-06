const jwt = require('jsonwebtoken')
const User = require('../models').User
const request = require('request')

module.exports = {

  // This is a crucial part of the application. If any errors are here then everything else is compromised. As a mere
  // commenting participant author I might be blind to errors.
  //
  // PLEASE CHECK THIS :)
  //
  login(req, res) {
    
    const options = {
      method: 'post',
      uri: 'https://opetushallinto.cs.helsinki.fi/login',
      strictSSL: false,
      json: { 'username': req.body.username, 'password': req.body.password }
    }

    const result = request(options, function (err, resp, body) {
      console.log('testitulostus: ', result.response.body)
      if (err) {
        console.log(err)
      }
      

      if (result.response.body.username && result.response.body.error !== 'wrong credentials') {
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
          .spread((newuser, created) => {

            if (!(newuser.firsts === body.first_names && newuser.lastname === body.last_name)) {
              User.update(
                { firsts: body.first_names, lastname: body.last_name },
                { where: { id: newuser.id } }
              )
            }

            // ^ SIDENOTE HERE: There can be a situation where the user has not a studentnumber but later gets it.

            console.log(newuser.get({
              plain: true
            }))

            const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
            const returnedUser = {
              id: user.id,
              email: user.email,
              firsts: user.firsts,
              lastname: user.lastname,
              studentNumber: user.studentnumber,
              username: user.username
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
