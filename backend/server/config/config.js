require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: '127.0.0.1',
    dialect: 'postgres',
    operatorsAliases: 'false',
    kurki_url: process.env.KURKI_URL == null ? "https://opetushallinto.cs.helsinki.fi" : process.env.KURKI_URL
  },
  test: {
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'labtool_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    operatorsAliases: false,
    logging: false,
    kurki_url: "https://opetushallinto.cs.helsinki.fi"
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    operatorsAliases: 'false',
    logging: false,
    kurki_url: "https://opetushallinto.cs.helsinki.fi"
  }
}
