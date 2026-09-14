const morgan = require('morgan')

const logger = require('./logger')

const requestLogger = morgan((tokens, req, res) => {
  const { uid } = req.headers
  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const status = tokens.status(req, res)
  const responseTime = tokens['response-time'](req, res)
  const userAgent = tokens['user-agent'](req, res)

  const message = `${method} ${url} ${status} - ${responseTime} ms`

  const additionalInfo = {
    userId: uid,
    method,
    referrer: req.headers.referer,
    url,
    status,
    responseTime,
    userAgent
  }

  const statusCode = Number(status)
  if (statusCode >= 500) {
    logger.error(message, additionalInfo)
  } else if (statusCode >= 400) {
    logger.warn(message, additionalInfo)
  } else {
    logger.info(message, additionalInfo)
  }
})

module.exports = requestLogger
