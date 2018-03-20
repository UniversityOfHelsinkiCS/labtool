const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const User = require('../models').User
const helper = require('../helpers/course_instance_helper')


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
    let token = helper.tokenVerify(req)

    console.log(token)

    if (token.verified) {

      CourseInstance.findAll({
        where: {
          ohid: req.params.ohid
        }
      })
        .then(course => {
          if (!course) {
            return res.status(400).send({
              message: 'course instance not found',
            })
          }
          User.findById(token.data.id).then(user => {
            if (!user) {
              return res.status(400).send({
                message: 'something went wrong',
              })
            }
            if (helper.checkWebOodi(req, res, user)) {
              StudentInstance.findOrCreate({
                where: {
                  userId: user.id,
                  courseInstanceId: course.id
                },
                defaults: {
                  userId: user.id,
                  courseInstanceId: course.id,
                  github: 'forgot_this...',
                  projectName: 'also this..'
                }
              }).then(student_added_and_these_table_names_are_not_what_they_should => {
                if (!student_added_and_these_table_names_are_not_what_they_should) {
                  res.status(400).send({
                    message: 'something went wrong'
                  })
                } else {
                  res.status(200).send({
                    message: 'something went right',
                    whatever: student_added_and_these_table_names_are_not_what_they_should
                  })
                }

              })

            } else {

              res.status(400).send({
                message: 'something went wrong'
              })

            }
          })
        })
    } else {
      errors.push('token verification failed')
      res.status(400).send(errors)
    }
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
    let token = helper.tokenVerify(req)

    console.log(token)

    if (token.verified) {
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
    } else {
      errors.push('token verification failed')
      res.status(400).send(errors)
    }

  },


  getNew(req, res) {
    console.log('update current...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    console.log('autentikaatio: ', auth)
    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
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
          console.log('json palautta...')
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: {ohid: instance.id},
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          res.status(204).send({'hello': 'hello'})
        }
        )
      }
    }
  }
  ,

  getNewer(req, res) {
    console.log('update next...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
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
              where: {ohid: instance.id},
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          res.status(204).send({'hello': 'hello'})
        })
      }
    }
  }
}