const path = require('path')
const Umzug = require('umzug')

const db = require('../models')
const logger = require('./logger')

const retryDelay = Number(process.env.DB_RETRY_DELAY_MS) || 5000
// production database has been manually migrated, so it is risky to run migrations at the moment
const shouldRunMigrations = process.env.NODE_ENV === 'staging'

const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, '../migrations'),
    params: [db.sequelize.getQueryInterface(), db.Sequelize],
    pattern: /^\d+[\w-]+\.js$/
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: db.sequelize
  },
  logging: message => logger.info(message)
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const runMigrations = async () => {
  if (!shouldRunMigrations) {
    logger.info(`Skipping database migrations in ${process.env.NODE_ENV || 'development'} environment`)
    return []
  }

  const migrations = await umzug.up()
  logger.info('Database migrations are up to date')

  return migrations
}

const testConnection = async () => {
  await db.sequelize.authenticate()
  await runMigrations()
}

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection()
    logger.info('Connected to database')
  } catch (error) {
    logger.warn(
      `Database connection attempt ${attempt + 1} failed; retrying in ${retryDelay} ms: ${error.message}`
    )
    await sleep(retryDelay)

    return connectToDatabase(attempt + 1)
  }

  return null
}

module.exports = {
  connectToDatabase,
  runMigrations
}
