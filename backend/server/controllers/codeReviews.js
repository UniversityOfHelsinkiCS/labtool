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
      const allStudentInstancesIds = [] // Gather all student instance ids for future query
      const values = req.body.codeReviews.map(codeReview => {
        if (typeof codeReview.reviewer !== 'number' || typeof codeReview.toReview !== 'number') {
          return null // This will lead to rejection later.
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
        // Malformed items in codeReviews are replaced by null.
        res.status(400).send('Malformed codeReview.')
        return
      }
      // Get all studentInstances that have been referenced for validation purposes.
      const allStudentInstances = await StudentInstance.findAll({
        where: {
          id: allStudentInstancesIds
        }
      })
      const courseId = allStudentInstances[0].courseInstanceId // All studentInstances and the teacherInstance must share this common course.
      if (allStudentInstances.map(si => si.courseInstanceId).filter(ciid => ciid !== courseId).length > 0) {
        // All studentInstances should be on the same course.
        res.status(400).send('Given student instances are from multiple courses.')
        return
      }
      // Getting the request maker's teacher instance for validation purposes.
      const requestMakerAsTeacher = await TeacherInstance.findOne({
        where: {
          userId: req.decoded.id,
          courseInstanceId: courseId
        }
      })
      if (!requestMakerAsTeacher) {
        // If the request maker is not a teacher on the course, reject.
        res.status(403).send('You must be a teacher of the course to perform this action.')
        return
      }
      await CodeReview.bulkCreate(values, { individualHooks: true }) // This is where the magic happens.
      res.status(201).send('All code reviews inserted.')
    } catch (e) {
      console.log('CodeReview bulk insert failed.\n', e)
      res.status(500).send('Unexpected error.')
    }
  }
}
