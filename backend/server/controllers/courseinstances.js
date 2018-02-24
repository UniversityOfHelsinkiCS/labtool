const CourseInstance = require('../models').CourseInstance

module.exports = {

  create(req, res) {
    return CourseInstance
      .create({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        active: req.body.active,
        week_amount: req.body.week_amount,
        week_max_points: req.body.week_max_points,
        current_week: req.body.current_week,
        courseId: req.body.courseId
      })
      .then(CourseInstance => res.status(201).send(CourseInstance))
      .catch(error => res.status(400).send(error))
  },

  update(req, res) {
    return CourseInstance
      .find({
        where: {
          courseId: req.params.courseId,
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
            week_amount: req.body.week_amount || courseInstance.week_amount,
            week_max_points: req.body.week_max_points || courseInstance.week_max_points,
            current_week: req.body.current_week || courseInstance.current_week,
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
    return CourseInstance
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
  },

  getNew(req, res) {
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      const request = require('request')
      const options = {
        method: 'get',
        // terms: S = autumn, K = spring, V = summer
        uri: 'https://opetushallinto.cs.helsinki.fi/labtool/courses?year=2018&term=K',
        headers: {
          "Content-Type": "application/json",
          "Authorization": auth
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