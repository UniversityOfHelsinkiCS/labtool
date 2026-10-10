require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT,
    dialect: 'postgres',
    kurki_url: process.env.KURKI_URL == null ? 'https://importer.cs.helsinki.fi/api/importer' : process.env.KURKI_URL
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'labtool_test', // intentionally not overridable so tests can never truncate a dev DB
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    kurki_url: 'https://importer.cs.helsinki.fi/api/importer'
  },
  staging: {
    database_url: process.env.DATABASE_URL,
    kurki_url: process.env.KURKI_URL == null ? 'https://importer.cs.helsinki.fi/api/importer' : process.env.KURKI_URL
  },
  production: {
    database_url: process.env.DATABASE_URL,
    kurki_url: process.env.KURKI_URL == null ? 'https://importer.cs.helsinki.fi/api/importer' : process.env.KURKI_URL
  }
}
