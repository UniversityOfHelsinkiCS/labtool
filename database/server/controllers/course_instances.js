const CourseInstance = require('../models').Course_instances

module.exports = {

  create(req, res) {
    console.log(CourseInstance, 'JEEEEEEEEEEEEE')
    return CourseInstance
      .create({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        active: req.body.active,
        week_amount: req.body.week_amount,
        week_max_points: req.body.week_max_points,
        current_week: req.body.current_week
      })
      .then(CourseInstance => res.status(201).send(CourseInstance))
      .catch(error => res.status(400).send(error))
  }
  
}