const helper = require('../helpers/checklist_helper')
const TeacherInstance = require('../models').TeacherInstance

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
      let checklistAsJSON
      try {
        checklistAsJSON = JSON.parse(req.body.checklist)
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
      // TODO create checklist.
      res.status(200).send({
        message: 'checklist created succesfully.',
        data: req.body
      })
    } catch (e) {
      res.status(500).send('Unexpected error')
      console.log(e)
    }
  }
}