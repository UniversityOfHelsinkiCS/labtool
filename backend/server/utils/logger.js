const Log2gelf = require('winston-log2gelf')
const winston = require('winston')
const moment = require('moment')


const { combine, timestamp, prettyPrint } = winston.format
const transports = []

if (process.env.NODE_ENV !== 'test') {
  transports.push(new winston.transports.File({ filename: 'debug.log' }))
}

transports.push(new (winston.transports.Console)())

if (process.env.LOG_PORT && process.env.LOG_HOST) {
  transports.push(new winston.transports.Log2gelf({
    hostname: 'labtool-backend',
    host: process.env.LOG_HOST,
    port: process.env.LOG_PORT,
    protocol: 'http'
  }))
}

const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: () => {
        return moment().format('DD-MM-YYYY HH:mm:ss')
      }
    }),
    prettyPrint({ depth: 5 })
  ),
  transports
})

module.exports = logger

