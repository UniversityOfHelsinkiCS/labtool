let express = require('express')
let app = express()
let bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

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
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

/**
 *
 * @param request
 * @param response
 * @param next
 */
const authenticate = (request, response, next) => {
  const excludedPaths = [ '/api/login', '/api' ]
  console.log(request.path)
  if ( !excludedPaths.includes(request.path) ) {
    try {
      let decoded = jwt.verify(request.token, process.env.SECRET)
      request.decoded = decoded,
      request.authenticated = { success: true, error: ''}
    } catch (e) {
      request.authenticated = { success: false, error: 'token verification failed'}
    }
  }
  console.log(request.method)
  next()
}
app.use(authenticate)

app.use(extractToken)




// old and should be cleaned if authenticate middleware is ok for the whole app in #127
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

// Exoress reitti määrittelyt
require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/loginRouter')(app)

app.get('*', (req, res) => res.status(404).send({
  message: 'Not found.',
}))

let server = app.listen(3001, function () {
  let port = server.address().port
  console.log('Backend is listening on port %s', port)
})

module.exports = server
