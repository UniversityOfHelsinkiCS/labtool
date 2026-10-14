const express = require('express')

const app = express()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const headerMiddleware = require('unfuck-utf8-headers-middleware')
const helmet = require('helmet')
const logger = require('./server/utils/logger')
const requestLogger = require('./server/utils/requestLogger')
const { HttpError } = require('./server/utils/httpError')

require('dotenv').config()

const { connectToDatabase } = require('./server/utils/database')

const USE_FAKE_LOGIN = process.env.USE_FAKE_LOGIN === 'ThisIsNotProduction'

if (USE_FAKE_LOGIN) {
  console.warn('YOU ARE USING FAKE LOGIN !!! MAKE SURE YOU ARE NOT IN PRODUCTION')
}

app.use(requestLogger)

// Security headers (CSP, nosniff, frame and referrer policies, HSTS, no X-Powered-By). The frontend is
// on another port in development, so resources may be read same-site rather than only same-origin.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))

/**
 * Fix charset for shibboleth headers
 */
const shibbolethHeaders = [
  'uid',
  'givenname', // First name
  'mail', // Email
  'hypersonstudentid', // Contains student number
  'sn' // Last name
]
app.use(headerMiddleware(shibbolethHeaders))

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
  // add Shibboleth headers if fake login allowed WHICH SHOULD NEVER BE ON PRODUCTION!!
  const extra = USE_FAKE_LOGIN ? ', uid, employeenumber, mail, hypersonstudentid, givenname, sn' : ''
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', `Origin, X-Requested-With, Content-Type, Accept, Authorization${extra}`)
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
      const decoded = jwt.verify(request.token, process.env.SECRET, { algorithms: ['HS256'] })
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

/**
 * Every API route except these requires a valid token. Handlers can therefore rely on req.decoded
 * and only check permissions (server/helpers/auth.js). CORS preflights carry no token.
 */
const publicApiPaths = ['/api', '/api/ping', '/api/login', '/api/loginFake', '/api/logout']

const requireAuth = (req, res, next) => {
  const path = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path
  if (req.method === 'OPTIONS' || !path.startsWith('/api') || publicApiPaths.includes(path)) {
    next()
    return
  }
  if (!req.authenticated.success) {
    res.status(401).send({ message: 'you have to be authenticated' })
    return
  }
  next()
}
app.use(requireAuth)

/**
 * Express 4 does not catch rejected promises of async route handlers, and on Node 15+ an
 * unhandled rejection crashes the whole backend. Pass them on to the error handler below.
 */
const catchAsyncErrors = handler => (typeof handler === 'function' && handler.length < 4
  ? (req, res, next) => {
    const result = handler(req, res, next)
    if (result && typeof result.catch === 'function') {
      result.catch(next)
    }
  }
  : handler)

;['get', 'post', 'put', 'delete'].forEach((method) => {
  const register = app[method].bind(app)
  // app.get(name) with a single argument reads a setting
  app[method] = (path, ...handlers) => (handlers.length === 0
    ? register(path)
    : register(path, ...handlers.map(catchAsyncErrors)))
})

// Express reitti määrittelyt
require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/loginRouter')(app)
require('./server/routes/adminRoutes')(app)
require('./server/routes/codeReviewRoutes')(app)
require('./server/routes/checklistRoutes')(app)
require('./server/routes/tagRoutes')(app)
require('./server/routes/emailRoutes')(app)
require('./server/routes/courseImportRoutes')(app)
require('./server/routes/changeLogRoutes')(app)

app.get('*', (req, res) => res.status(404).send({
  message: 'Not found.'
})
)

// Every error response is { message }. An HttpError (server/utils/httpError.js) carries a message meant
// for the user; other errors are logged but never sent to the client: Sequelize errors contain SQL and parameters.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error instanceof HttpError) {
    if (!res.headersSent) {
      res.status(error.status).send({ message: error.message })
    }
    return
  }
  logger.error(`Unhandled error in ${req.method} ${req.path}: ${error.stack || error.message || error}`)
  if (res.headersSent) {
    return
  }
  const status = error.status || error.statusCode
  if (status >= 400 && status < 500) {
    res.status(status).send({ message: 'Invalid request.' })
  } else {
    res.status(500).send({ message: 'Unexpected error. Please try again.' })
  }
})

const start = async () => {
  await connectToDatabase()

  return new Promise((resolve, reject) => {
    const server = app.listen(3001, () => {
      logger.info('Backend started and listening on port 3001')
      resolve(server)
    })

    server.once('error', reject)
  })
}

if (require.main === module) {
  // A promise a handler did not await must not take the whole backend down.
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled promise rejection: ${(reason && reason.stack) || reason}`)
  })

  start().catch((error) => {
    logger.error(`Backend startup failed: ${error.stack || error.message}`)
    process.exit(1)
  })
}

module.exports = { app, start }