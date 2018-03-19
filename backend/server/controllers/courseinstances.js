const CourseInstance = require('../models').CourseInstance
const jwt = require('jsonwebtoken')

const CurrentTermAndYear = () => {
  const date = new Date()
  const month = date.getMonth() + 1
  const currentTerm = getCurrentTerm(month)
  var year = date.getFullYear()
  console.log('month is: ', month)
  console.log('date: ', date)
  if (month >= 11) {
    year = year + 1
  }
  const currentYear = year.toString()
  var nextYear = getNextYear(currentTerm, year)
  nextYear.toString()
  const nextTerm = getNextTerm(currentTerm)
  console.log('year: ', year)
  return { currentYear, currentTerm, nextTerm, nextYear }
}

const getCurrentTerm = (month) => {
  if (1 <= month <= 5) {
    return 'K'
  }
  if (6 <= month <= 8) {
    return 'V'
  }
  if (9 <= month <= 12) {
    return 'S'
  }
}

const getNextYear = (currentTerm, currentYear) => {
  if (currentTerm === 'S') {
    return currentYear + 1
  } else {
    return currentYear
  }
}

const getNextTerm = (term) => {
  if (term === 'K') {
    return 'V'
  }
  if (term === 'V') {
    return 'S'
  }
  if (term === 'S') {
    return 'K'
  }
}

module.exports = {

  create(req, res) {
    console.log('REQ BODY: ', req.body)
    return CourseInstance
      .create({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        active: req.body.active,
        weekAmount: req.body.weekAmount,
        week_max_points: req.body.week_max_points,
        current_week: req.body.current_week,
        courseId: req.body.courseId
      })
      .then(CourseInstance => res.status(201).send(CourseInstance))
      .catch(error => res.status(400).send(error))
  },

  testi(req, res) {
    const errors = []

    jwt.verify(req.body.token, process.env.SECRET, function (err, decoded) {
      if (err) {
        errors.push('token verification failed')
        res.status(400).send(errors)
      } else {
        CourseInstance.findAll({
          where: {
            ohid: req.params.ohid
          }
        })
          .then(courseInstance => {
            if (!courseInstance) {
              return res.status(400).send({
                message: 'course instance not found',
              })
            }
            console.log(decoded.studentNumber)

            return courseInstance //  tämän sijaan tsekki että jou onko decoded.studentNumber kurssilla 
          })
      }
    })
  },

  update(req, res) {
    console.log('REQ body: ', req.body)
    console.log('REQ params: ', req.params)
    return CourseInstance
      .find({
        where: {
          id: req.params.id
        }
      })
      .then(courseInstance => {
        if (!courseInstance) {
          return res.status(400).send({
            message: 'course instance not found',
          })
        }
        return courseInstance
          .update({
            name: req.body.name || courseInstance.name,
            start: req.body.start || courseInstance.start,
            end: req.body.end || courseInstance.end,
            active: req.body.active || courseInstance.active,
            weekAmount: req.body.weekAmount || courseInstance.weekAmount,
            weekMaxPoints: req.body.weekMaxPoints || courseInstance.weekMaxPoints,
            currentWeek: req.body.currentWeek || courseInstance.currentWeek,
          })
          .then(updatedCourseInstance => res.status(200).send(updatedCourseInstance))
          .catch(error => res.status(400).send(error))
      })
      .catch(error => res.status(400).send(error))
  },

  list(req, res) {
    return CourseInstance.findAll()
      .then(instance => res.status(200).send(instance))
      .catch(error => res.status(400).send(error))
  },

  destroy(req, res) {
    return CourseInstance
      .find({
        where: {
          id: req.params.id,
        },
      })
      .then(courseInstance => {
        if (!courseInstance) {
          return res.status(400).send({
            message: 'course instance not found',
          })
        }
        return courseInstance
          .destroy()
          .then(() => res.status(204).send())
          .catch(error => res.status(400).send(error))
      })
      .catch(error => res.status(400).send(error))
  },

  retrieve(req, res) {
    const errors = []
    return (
      jwt.verify(req.token, process.env.SECRET, function (err, decoded) {
        if (err) {
          errors.push('token verification failed')
          res.status(400).send(errors)
        } else {
          CourseInstance
            .findById(req.params.id, {})
            .then(courseInstance => {
              if (!courseInstance) {
                return res.status(404).send({
                  message: 'Course not Found',
                })
              }
              return res.status(200).send(courseInstance)
            })
            .catch(error => res.status(400).send(error))
        }
      }

      )
    )
  },

  getNew(req, res) {
    console.log('update current...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    console.log('autentikaatio: ', auth)
    const termAndYear = CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.11111312') {
        res.send('gtfo')

      } else {
        const request = require('request')
        const options = {
          method: 'get',
          uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses?year=${termAndYear.currentYear}&term=${termAndYear.currentTerm}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          strictSSL: false
        }
        request(options, function (err, resp, body) {
          const json = JSON.parse(body)
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: { ohid: instance.id },
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          res.status(204).send({ 'hello': 'hello' })
        }
        )
      }
    }
  },

  getNewer(req, res) {
    console.log('update next...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    const termAndYear = CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1321321214') {
        res.send('gtfo')

      } else {

        const request = require('request')
        const options = {
          method: 'get',
          uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses?year=${termAndYear.nextYear}&term=${termAndYear.nextTerm}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          strictSSL: false
        }
        request(options, function (err, resp, body) {
          const json = JSON.parse(body)
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: { ohid: instance.id },
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          res.status(204).send({ 'hello': 'hello' })
        })
      }
    }
  }
}