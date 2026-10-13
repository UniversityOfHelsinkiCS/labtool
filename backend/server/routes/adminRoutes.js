const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')
const { admin } = require('../controllers')

const staticUserAuth = basicAuth({
  users: { admin: process.env.ADMIN_PW },
  challenge: true,
  realm: 'labtooladmin'
})
const parser = bodyParser.urlencoded({ extended: true })

module.exports = (app) => {
  app.get('/admin', staticUserAuth, parser, admin.list)
  app.post('/admin', staticUserAuth, parser, admin.process)
}
