const express = require('express');
const app = express();

app.get('/labtool/courses', (req, res) => {
  const responseJson = require('responses/courses');
  res.json(responseJson);
})

app.get('/labtool/courses/:id', (req, res) => {
  const responseJson = require(`responses/$(req.params.id)`);
  res.json(responseJson);
})

app.post('/login', (req, res) => {
  const responseJson = {
    "username": req.body.username,
    "student_number": "014822548",
    "first_names": "Jamppa Jari",
    "last_name": "Pyöveli"
  };
})

app.listen(3002, () => console.log('Fake Kurki listening on port 3002.'));