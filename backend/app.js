const express = require('express')

const app = express()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const Raven = require('raven')
const logger = require('./server/utils/logger')

Raven.config(process.env.SENTRY_ADDR).install()

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
    res.send('Please restart the backend with the correct TOKEN environment variable set').end()
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
    res.send('Please restart the backend having the SECRET environment variable set').end()
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
    res.send('Please restart the backend with a ADMIN_PW environment variable set').end()
  } else {
    next()
  }
}

app.use(adminPwToken)

/**
 * Makes any request body easily accessible through making it to javascript kid friendly JSON.
 */
app.use(bodyParser.json())

app.use((req, res, next) => {
  const extra = process.env.USE_FAKE_LOGIN ? ', uid, employeenumber, mail, schacpersonaluniquecode, givenname, sn' : ''
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization' + extra)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})

const fakeshibbo = (req, res, next) => {
  /*
  req.headers.uid = 'tiraopiskelija1'
  req.headers.employeenumber = '1234567'
  req.headers.mail = 'maarit.opiskelija@helsinki.fi'
  req.headers.schacpersonaluniquecode = 'urn:schac:personalUniqueCode:int:studentID:helsinki.fi:014578343'
  req.headers.givenname = 'Maarit'
  req.headers.sn = 'Opiskelija'
  */
  console.log(req.url, req.headers)
  next()
}

if (process.env.USE_FAKE_LOGIN) {
  console.log('YOU ARE USING FAKE LOGIN !!! MAKE SURE YOU ARE NOT IN PRODUCTION')
  app.use(fakeshibbo)
}

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
      const decoded = jwt.verify(request.token, process.env.SECRET)
      request.decoded = decoded
      request.authenticated = { success: true, error: '' }
    } catch (e) {
      request.authenticated = { success: false, error: 'token verification failed' }
      // logger.error(e)
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
require('./server/routes/codeReviewRoutes')(app)
require('./server/routes/checklistRoutes')(app)
require('./server/routes/tagRoutes')(app)
require('./server/routes/checklistRoutes')(app)
require('./server/routes/emailRoutes')(app)

app.get('*', (req, res) => res.status(404).send({
  message: 'Not found.'
})
)

const server = app.listen(3001, () => {
  const port = server.address().port
  logger.info(`Backend started and listening on port ${port}`)
  // TODO: Add info if using fakeshibbo (Riku).
})

module.exports = server
