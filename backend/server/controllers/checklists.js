const helper = require('../helpers/checklist_helper')
const TeacherInstance = require('../models').TeacherInstance
const Checklist = require('../models').Checklist

module.exports = {
  async create(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (typeof req.body.week !== 'number' || typeof req.body.courseInstanceId !== 'number') {
        res.status(400).send('Missing or malformed inputs.')
        return
      }
      try {
        // TODO validate integrity of provided JSON.
      } catch (e) {
        res.status(400).send('Cannot parse checklist JSON.')
        return
      }
      const teacherInstance = await TeacherInstance.findOne({
        attributes: ['id'],
        where: {
          courseInstanceId: req.body.courseInstanceId
        }
      })
      if (!teacherInstance) {
        res.status(403).send('You must be a teacher of the course to perform this action.')
        return
      }
      const result = await Checklist.create({
        week: req.body.week,
        courseName: 'doot',
        list: req.body.checklist,
        courseInstanceId: req.body.courseInstanceId
      })
      res.status(200).send({
        message: 'checklist created succesfully.',
        result,
        data: req.body
      })
    } catch (e) {
      res.status(500).send(e)
      console.log(e)
    }
  }
}