const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/labtool/courses', (req, res) => {
  const responseJson = require('./responses/courses');
  res.json(responseJson.courses);
})

app.get('/labtool/courses/:id', (req, res) => {
  var address = './responses/';
  address += req.params.id;
  const responseJson = require(address);
  res.json(responseJson.course);
})

// If password is "password" and username is listed in
// ./reposonses/users logs in as username.
// Otherwise, does not let one log in.
app.post('/login', (req, res) => {

  var users = require('./responses/users').users
  console.log("Users: ", users)
  if (req.body.password === "password") {
    var user = users.filter(user => user.username === req.body.username)
    console.log("user after filtering: ", user)
    if (user.length === 0) {
      const errorMessage = {
        "error": "wrong credentials"
      }
      res.json(errorMessage)
    } else {
      res.json(user[0]);
    }
  }
})

app.listen(3002, () => console.log('Fake Kurki listening on port 3002.'));