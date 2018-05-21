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

app.post('/login', (req, res) => {
  const responseJson = {
    "username": req.body.username,
    "student_number": "014822548",
    "first_names": "Jamppa Jari",
    "last_name": "Pyöveli"
  };
  res.json(responseJson);
})

app.listen(3002, () => console.log('Fake Kurki listening on port 3002.'));