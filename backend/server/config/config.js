require('dotenv').config()

module.exports = {
  'development': {
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_NAME,
    'host': '127.0.0.1,
    'dialect': 'postgres',
    'operatorsAliases': 'false'
  },
  'test': {
    'username': process.env.CI_DB_USERNAME,
    'password': process.env.CI_DB_PASSWORD,
    'database': 'labtool_test',
    'host': '127.0.0.1',
    'dialect': 'postgres',
    'operatorsAliases': 'false'
  },
  'production': {
    'username': process.env.DB_USERNAME,
    'password': process.env.DB_PASSWORD,
    'database': process.env.DB_NAME,
    'host': process.env.DB_HOST,
    'dialect': 'postgres',
    'operatorsAliases': 'false'
  },
}
