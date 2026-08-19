const winston = require('winston')
const LokiTransport = require('winston-loki')

const isDeployedEnvironment = ['production', 'staging'].includes(process.env.NODE_ENV)

const LOKI_HOST = process.env.LOKI_HOST || 'http://loki-svc.toska-lokki.svc.cluster.local:3100'

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (isDeployedEnvironment) {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  }

  const deployedFormat = winston.format.printf(({ level, ...rest }) => JSON.stringify({
    level: levels[level],
    ...rest
  }))

  transports.push(new winston.transports.Console({ format: deployedFormat }))

  transports.push(new LokiTransport({
    host: LOKI_HOST,
    labels: {
      app: 'labtool',
      environment: process.env.NODE_ENV || 'production'
    }
  }))
}

const logger = winston.createLogger({ transports })

module.exports = logger
