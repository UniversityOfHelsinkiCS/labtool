let express = require('express')
let app = express()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
require('dotenv').config()

/**
 *
 * @param request sets the token into easily accessible variable request.token
 * @param response
 * @param next
 */
const extractToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
  }

  next()
}

app.use(extractToken)

/**
 *
 * @param req
 * @param res We send a message if TOKEN environment variable is not set and end the request processing immediately.
 * @param next
 */
const upstreamToken = (req, res, next) => {
  const auth = process.env.TOKEN || 'notset'
  if (auth === 'notset') {
    res.send('Please restart the backend with the correct TOKEN environment variable set')
    res.end
  } else {
    // should check if the token is valid but maybe not this time
    next()
  }
}

app.use(upstreamToken)

/**
 *
 * @param req
 * @param res We send a message if SECRET is not set and stop processing the request any further.
 * @param next
 */
const appSecretENV = (req, res, next) => {
  const secret = process.env.SECRET || 'notset'
  if (secret === 'notset') {
    res.send('Please restart the backend having the SECRET environment variable set')
    res.end
  } else {
    next()
  }
}

app.use(appSecretENV)

/**
 *
 * @param req
 * @param res We send a message if TOKEN environment variable is not set and end the request processing immediately.
 * @param next
 */
const adminPwToken = (req, res, next) => {
  const auth = process.env.ADMIN_PW || 'notset'
  if (auth === 'notset') {
    res.send('Please restart the backend with a ADMIN_PW environment variable set')
    res.end
  } else {
    next()
  }
}

app.use(adminPwToken)

/**
 * Makes any request body easily accessible through making it to javascript kid friendly JSON.
 */
app.use(bodyParser.json())

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world')
})

app.use(function(req, res, next) {
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
  const excludedPaths = ['/api/login', '/api', '/admin']
  if (!excludedPaths.includes(request.path)) {
    try {
      let decoded = jwt.verify(request.token, process.env.SECRET)
      ;(request.decoded = decoded), (request.authenticated = { success: true, error: '' })
      console.log('  Authenticated: true')
    } catch (e) {
      request.authenticated = { success: false, error: 'token verification failed' }
      console.log('  Authenticated: false')
    }
  }

  next()
}
app.use(authenticate)

// Express reitti määrittelyt
require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/loginRouter')(app)
require('./server/routes/adminRoutes')(app)

app.get('*', (req, res) =>
  res.status(404).send({
    message: 'Not found.'
  })
)

let server = app.listen(3001, function() {
  let port = server.address().port
  console.log('Backend is listening on port %s', port)
})

module.exports = server
