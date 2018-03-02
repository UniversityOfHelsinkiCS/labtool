let express = require('express')
let app = express()
let bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const User = require('./models').User
const request = require('request')

require('dotenv').config()

const extractToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}

app.use(extractToken)

app.use(bodyParser.json())
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')

})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  next()
})

// login
app.post('/login', function (req, res) {
    const options = {
    method: 'post',
    uri: 'https://opetushallinto.cs.helsinki.fi:443/login',
    strictSSL: false,
    json: {'username': req.body.username, 'password': req.body.password}
  }

  const result = request(options, function (err, resp, body) {
    if (err) {
      console.log(err)
    }

    if (result.response.body.error !== 'wrong credentials') {
      User
        .findOrCreate({
          where: {username: body.username},
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
})

const tokenVerify = ({ token }) => {
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      console.log(err)
      return ( { error: 'token verification failed'})
    } else {
      console.log(decoded)
      console.log(decoded.id)
      console.log(decoded.username)
      return decoded
    }
  })
}

app.use('/users', require('./controllers/user').userRoutes)

let server = app.listen(3001, function () {
  let port = server.address().port;
  console.log('Example app listening at port %s', port);
});

module.exports = server;
