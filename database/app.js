const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const app = express()
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

const extractToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  next()
}

const tokenVerify = ({ token }) => {
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
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
}

app.use(extractToken)

// Require our routes into the application.

require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/courseRouter')(app)
require('./server/routes/loginRouter')(app)
app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}))

module.exports = app