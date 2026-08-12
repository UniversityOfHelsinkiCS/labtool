const morgan = require('morgan')

const logger = require('./logger')

const inProduction = process.env.NODE_ENV === 'production'
const inStaging = process.env.NODE_ENV === 'staging'

const requestLogger = morgan((tokens, req, res) => {
  const { uid } = req.headers
  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const status = tokens.status(req, res)
  const responseTime = tokens['response-time'](req, res)
  const userAgent = tokens['user-agent'](req, res)

  const message = `${method} ${url} ${status} - ${responseTime} ms`

  const additionalInfo = inProduction || inStaging
    ? {
      userId: uid,
      method,
      referrer: req.headers.referer,
      url,
      status,
      responseTime,
      userAgent
    }
    : {}

  logger.info(message, additionalInfo)
})

module.exports = requestLogger
