const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const responseExists = name => fs.existsSync(path.join(__dirname, 'responses', name + '.js'));

// Terms with no response file get generated courses, so that course import works for whatever the
// current term is. Generated course codes end in "SIM<n>" (e.g. TKT20010.2026.S.K.SIM1), which lets
// the e2e seeder clean up imported courses.
const TERM_DATES = {
  K: ['01-15', '04-30'],
  V: ['06-01', '08-15'],
  S: ['09-05', '12-15']
};

const generatedCourses = (year, term) => {
  const [start, end] = TERM_DATES[term] || TERM_DATES.S;
  return [
    { code: 'TKT20010', name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit' },
    { code: 'TKT20011', name: 'Aineopintojen harjoitustyö: Tietokantasovellus' }
  ].map(course => ({
    id: `${course.code}.${year}.${term}.K.SIM1`,
    name: course.name,
    starts: `${year}-${start}T00:00:00.000Z`,
    ends: `${year}-${end}T00:00:00.000Z`
  }));
};

const generatedCourseDetails = {
  students: ['014578343', '014553242'],
  teachers: ['paaopettaja']
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/labtool/courses', (req, res) => {
  const termString = req.query.year + req.query.term
  if (!responseExists(termString)) {
    return res.json(generatedCourses(req.query.year, req.query.term));
  }
  const responseJson = require('./responses/' + termString);
  res.json(responseJson.courses);
})

app.get('/labtool/courses/:id', (req, res) => {
  if (!responseExists(req.params.id)) {
    return res.json(generatedCourseDetails);
  }
  var address = './responses/';
  address += req.params.id;
  const responseJson = require(address);
  res.json(responseJson.course);
})

// If password is "password" and username is listed in
// ./responses/users logs in as username.
// Otherwise, does not let one log in.
app.post('/login', (req, res) => {

  var users = require('./responses/users').users
  console.log("Users: ", users)
  const errorMessage = {
    "error": "wrong credentials"
  }
  if (req.body.password === "password") {
    var user = users.filter(user => user.username === req.body.username)
    console.log("user after filtering: ", user)
    if (user.length === 0) {
      res.json(errorMessage)
    } else {
      res.json(user[0]);
    }
  } else {
    res.json(errorMessage)
  }
})

app.listen(3002, () => console.log('Fake Kurki listening on port 3002.'));
