/*
 * Root-level mocha setup, loaded before every spec file via `--file` in test/mocha.opts.
 * - provides defaults for the env vars the app refuses to work without
 * - blocks all real network access (only localhost, i.e. supertest, is allowed)
 * - runs migrations once and wipes the database before every test
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test'
if (process.env.NODE_ENV !== 'test') {
  throw new Error(`Refusing to run the test suite with NODE_ENV=${process.env.NODE_ENV}`)
}
process.env.TOKEN = process.env.TOKEN || 'test-token'
process.env.SECRET = process.env.SECRET || 'test-secret'
process.env.ADMIN_PW = process.env.ADMIN_PW || 'test'
process.env.DB_RETRY_DELAY_MS = process.env.DB_RETRY_DELAY_MS || '1000'

const nock = require('nock')
const winston = require('winston')
const logger = require('../../server/utils/logger')
const { connectToDatabase } = require('../../server/utils/database')
const { cleanDatabase, closeDatabase } = require('./db')

// The test logger has no transports, which makes winston complain on every log call.
logger.add(new winston.transports.Console({ silent: true }))

nock.disableNetConnect()
nock.enableNetConnect(/^(127\.0\.0\.1|localhost)(:\d+)?$/)

before(async function () {
  this.timeout(120000)
  await connectToDatabase()
})

beforeEach(async () => {
  nock.cleanAll()
  await cleanDatabase()
})

after(async () => {
  nock.cleanAll()
  await closeDatabase()
})
