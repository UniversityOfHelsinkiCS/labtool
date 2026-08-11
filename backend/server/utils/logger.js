const winston = require('winston')
const LokiTransport = require('winston-loki')

const inProduction = process.env.NODE_ENV === 'production'

const LOKI_HOST = process.env.LOKI_HOST || 'http://loki-svc.toska-lokki.svc.cluster.local:3100'

const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

if (!inProduction) {
  // for now we decided to not get staging spam to our logging
  // const { combine, timestamp, printf, splat } = winston.format
  //
  // const devFormat = printf(({ level, message, timestamp, ...rest }) => {
  //   let restString = ''
  //   try {
  //     restString = JSON.stringify(rest)
  //   } catch (e) {
  //     restString = 'Error stringifying rest'
  //   }
  //
  //   return `${timestamp} ${level}: ${message} ${restString}`
  // })
  //
  // transports.push(
  //   new winston.transports.Console({
  //     level: 'debug',
  //     format: combine(splat(), timestamp(), devFormat)
  //   })
  // )
} else {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  }

  const prodFormat = winston.format.printf(({ level, ...rest }) => JSON.stringify({
    level: levels[level],
    ...rest
  }))

  transports.push(new winston.transports.Console({ format: prodFormat }))

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
