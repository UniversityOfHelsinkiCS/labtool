const CodeReview = require('../models').CodeReview
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const helper = require('../helpers/code_review_helper')

module.exports = {
  async bulkInsert(req, res) {
    helper.controller_before_auth_check_action(req, res)
    try {
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (!Array.isArray(req.body.codeReviews || typeof req.body.reviewNumber !== 'number')) {
        res.status(400).send('Missing or malformed inputs.')
        return
      }
      const allStudentInstancesIds = []
      const values = req.body.codeReviews.map(codeReview => {
        if (typeof codeReview.reviewer !== 'number' || typeof codeReview.toReview !== 'number') {
          return null
        }
        allStudentInstancesIds.push(codeReview.reviewer)
        allStudentInstancesIds.push(codeReview.toReview)
        return {
          studentInstanceId: codeReview.reviewer,
          reviewNumber: req.body.reviewNumber,
          toReview: codeReview.toReview
        }
      })
      if (values.indexOf(null) !== -1) {
        res.status(400).send('Malformed codeReview.')
        return
      }
      const allStudentInstances = await StudentInstance.findAll({
        where: {
          id: allStudentInstancesIds
        }
      })
      if (allStudentInstances.length === 0) {
        res.status(404).send('None of the student instances were found.')
      }
      const courseId = allStudentInstances[0].courseInstanceId
      if (allStudentInstances.map(si => si.courseInstanceId).filter(ciid => ciid !== courseId).length > 0) {
        res.status(400).send('Given student instances are from multiple courses.')
        return
      }
      const requestMakerAsTeacher = await TeacherInstance.findOne({
        where: {
          userId: req.decoded.id,
          courseInstanceId: courseId
        }
      })
      if (!requestMakerAsTeacher) {
        res.status(403).send('You must be a teacher of the course to perform this action.')
        return
      }
      await CodeReview.bulkCreate(values, { individualHooks: true })
      const result = await CodeReview.findAll()
      res.status(201).json(result)
    } catch (e) {
      console.log('CodeReview bulk insert failed.\n', e)
      res.status(500).send('Unexpected error.')
    }
  }
}
