let express = require('express')
let app = express()
let bodyParser = require('body-parser')

require('dotenv').config()

app.use(bodyParser.json())
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// login
app.post('/login', function (req, res) {
  const request = require('request')
  const options = {
    method: 'post',
    uri: 'https://opetushallinto.cs.helsinki.fi/login',
    strictSSL: false,
    json: {'username': req.body.username, 'password': req.body.password}
  }

  const result = request(options, function (err, resp, body) {
    if (err) {
      console.log(err)
    }
    console.log(result.response.body.error)

    if (result.response.body.error !== 'wrong credentials') {
      const User = require('./models').User
      User
        .findOrCreate({
          where: {username: body.username},
          defaults: {
            firsts: body.first_names,
            lastname: body.last_name,
            studentnumber: body.student_number
          }
        })
        .spread((user, created) => {
          console.log(user.get({
            plain: true
          }))
          console.log(created)
          res = user.get({plain: true})
        })
    }
    res.send(body)
  })
})
app.use('/users', require('./controllers/user').userRoutes)

app.listen(3001, () => console.log('Example app listening on port 3001!'))
