const admin = require('../controllers').admin
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')
const staticUserAuth = basicAuth({
  users: {'admin': process.env.ADMIN_PW},
  challenge: true,
  realm: 'labtooladmin'
})
const parser = bodyParser.urlencoded({extended: true})

module.exports = (app) => {

  app.get('/admin', staticUserAuth, parser, admin.list).set('view engine', 'pug')
  app.post('/admin', staticUserAuth, parser, admin.process).set('view engine', 'pug')
}