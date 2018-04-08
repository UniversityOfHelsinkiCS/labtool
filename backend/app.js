let express = require('express')
let app = express()
let bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const extractToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }

  next()
}


app.use(extractToken)

app.use(bodyParser.json())
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world')

})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  next()
})


const authenticate = (request, response, next) => {
  const excludedPaths = [ '/api/login', '/api' ]
  console.log(request.path)
  if ( !excludedPaths.includes(request.path) ) {
    try {
      let decoded = jwt.verify(request.token, process.env.SECRET)
      request.decoded = decoded
    } catch (e) {
      response.status(400).send({error: 'token verification failed'})
    }
  }
  // this is according to javascript kiddies some "hack" or whatever to let options through x)
  console.log(request.method)
  if (request.method == 'OPTIONS') {
    response.sendStatus(204)
    response.end
  }
  else {
    next()
  }
}

app.use(authenticate)



const tokenVerify = ({ token }) => {
  jwt.verify(token, process.env.SECRET, function (err, decoded) {
    if (err) {
      console.log(err)
      return ( { error: 'token verification failed'})
    } else {
      console.log(decoded)
      console.log(decoded.id)
      console.log(decoded.username)
      return decoded
    }
  })
}

// Sequelize reitti määrittelyt
require('./server/routes')(app)
require('./server/routes/userRouter')(app)
require('./server/routes/courseInstanceRouter')(app)
require('./server/routes/courseRouter')(app)
require('./server/routes/loginRouter')(app)
require('./server/routes/studentInstanceRouter')(app)
require('./server/routes/teacherInstanceRouter')(app)
require('./server/routes/weekRouter')(app)
app.get('*', (req, res) => res.status(404).send({
  message: 'Not found.',
}))

let server = app.listen(3001, function () {
  let port = server.address().port
  console.log('Backend is listening on port %s', port)
})

module.exports = server
