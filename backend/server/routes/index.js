const logger = require('../utils/logger')

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the COURSES API!'
  })
  )

  app.get('/api/ping', (req, res) => {
    logger.info('Ping endpoint called', {
    })

    return res.status(200).send({
      message: 'pong'
    })
  })
}
