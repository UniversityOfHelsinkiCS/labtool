let express = require('express')
let app = express()
let bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
<<<<<<< HEAD
const User = require('./models').User
const request = require('request')
=======
>>>>>>> 536c6c61a3677e7890222a06c3b8c878f4a7f7d9

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

<<<<<<< HEAD
// login
app.post('/login', function (req, res) {
    const options = {
=======
// login Oikea logini server/controllers/login ...
/* app.post('/login', function (req, res) {
  const request = require('request')
  const options = {
>>>>>>> 536c6c61a3677e7890222a06c3b8c878f4a7f7d9
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
}) */

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

// Sequelize reitti määrittelyt
require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/courseRouter')(app)
require('./server/routes/loginRouter')(app)
require('./server/routes/studentInstanceRouter')(app)
require('./server/routes/teacherInstanceRouter')(app)
require('./server/routes/weekRouter')(app)
app.get('*', (req, res) => res.status(404).send({
  message: 'Not found.',
}))

let server = app.listen(3001, function () {
  let port = server.address().port
  console.log('Backend is listening on port %s', port)
})

<<<<<<< HEAD
let server = app.listen(3001, function () {
  let port = server.address().port;
  console.log('Example app listening at port %s', port);
});

module.exports = server;
=======
module.exports = server
>>>>>>> 536c6c61a3677e7890222a06c3b8c878f4a7f7d9
