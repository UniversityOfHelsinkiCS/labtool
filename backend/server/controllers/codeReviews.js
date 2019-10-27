const Sequelize = require('sequelize')
const { CodeReview, StudentInstance, TeacherInstance, CourseInstance } = require('../models')
const helper = require('../helpers/codeReviewHelper')
const logger = require('../utils/logger')

const { Op } = Sequelize

async function formatCodeReview(codeReview, allStudentInstancesIds, reviewNumber) {
  if (typeof codeReview.reviewer !== 'number') {
    return null// This will lead to rejection later.
  }
  if (typeof codeReview.toReview !== 'number') {
    if (!codeReview.repoToReview || !codeReview.repoToReview.includes('http')) {
      return null
    }
  }
  const reviewed = await CodeReview.findAll({
    raw: true,
    attributes: ['toReview', 'repoToReview'],
    where: {
      reviewNumber: { [Op.lt]: reviewNumber },
      studentInstanceId: codeReview.reviewer
    }
  }).then(r => r)
  const repeated = reviewed.filter(r => r.toReview === codeReview.toReview || r.repoToReview === codeReview.repoToReview).length > 0
  if (repeated) {
    return null
  }

  allStudentInstancesIds.push(codeReview.reviewer)
  return {
    studentInstanceId: codeReview.reviewer,
    reviewNumber,
    toReview: Number.isInteger(codeReview.toReview) ? codeReview.toReview : null,
    repoToReview: Number.isInteger(codeReview.toReview) ? null : codeReview.repoToReview
  }
}


module.exports = {
  async bulkInsert(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (!Array.isArray(req.body.codeReviews || typeof req.body.reviewNumber !== 'number')) {
        res.status(400).send('Missing or malformed inputs.')
        return
      }
      if (req.body.codeReviews.length === 0) {
        res.status(400).send('No code reviews were provided.')
        return
      }
      const allStudentInstancesIds = [] // Gather all student instance ids for future query
      const values = await Promise.all(
        req.body.codeReviews.map(
          codeReview => formatCodeReview(codeReview, allStudentInstancesIds, req.body.reviewNumber)
        )
      )
      if (values.indexOf(null) !== -1) {
        // Malformed items in codeReviews are replaced by null.
        res.status(400).send('Malformed codeReview or code review is repeated.')
        return
      }
      // Get all studentInstances that have been referenced for validation purposes.
      const allStudentInstances = await StudentInstance.findAll({
        where: {
          id: allStudentInstancesIds
        }
      })
      // All studentInstances and the teacherInstance must share this common course.
      const courseId = allStudentInstances[0].courseInstanceId
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

      const courseToUpdate = await CourseInstance.findOne({
        where: { id: req.body.courseId }
      })
      if (req.body.createTrue) {
        courseToUpdate.update({
          amountOfCodeReviews: courseToUpdate.amountOfCodeReviews + 1
        })
      }
      res.status(201).send({
        message: 'All code reviews inserted.',
        data: req.body
      })
    } catch (e) {
      logger.error('CodeReview bulk insert failed.', { error: e.message })
      res.status(500).send('Unexpected error.')
    }
  },

  async grade(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (typeof req.body.studentInstanceId !== 'number'
        || typeof req.body.reviewNumber !== 'number'
        || typeof req.body.points !== 'number') {
        res.status(400).send('Missing or malformed inputs.')
        return
      }
      const studentInstance = await StudentInstance.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          id: req.body.studentInstanceId
        }
      })
      if (!studentInstance) {
        res.status(404).send('No student instance matched given id.')
        return
      }
      const courseId = studentInstance.courseInstanceId
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
      const modifiedRows = await CodeReview.update(
        {
          points: req.body.points
        },
        {
          where: {
            studentInstanceId: req.body.studentInstanceId,
            reviewNumber: req.body.reviewNumber
          }
        }
      )
      if (modifiedRows === 0) {
        res.status(404).send('No code review matched the given studentInstanceId and reviewNumber.')
      }
      res.status(200).send({
        message: 'Code review points updated successfully',
        data: req.body
      })
      return
    } catch (e) {
      res.status(500).send('Unexpected error.')
    }
  },

  async addLink(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (!req.authenticated.success) {
        res.status(403).send('You have to be authenticated to do this')
        return
      }
      if (!(req.body.linkToReview.startsWith('http://') || req.body.linkToReview.startsWith('https://'))) {
        res.status(400).send('A link usually starts with http:// or https://')
        return
      }

      const studentInstance = await StudentInstance.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          id: req.body.studentInstanceId
        }
      })
      if (!studentInstance) {
        res.status(404).send('No student instance matched given id.')
        return
      }

      const modifiedRows = await CodeReview.update(
        {
          linkToReview: req.body.linkToReview
        },
        {
          where: {
            studentInstanceId: req.body.studentInstanceId,
            reviewNumber: req.body.reviewNumber
          }
        }
      )
      if (modifiedRows === 0) {
        res.status(404).send('No code review matched the given studentInstanceId and reviewNumber.')
      }
      res.status(200).send({
        message: 'Code review link added successfully',
        data: req.body
      })
      return
    } catch (e) {
      res.status(500).send('Unexpected error.')
    }
  },

  async removeOne(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (!req.authenticated.success) {
        res.status(403).send('You have to be authenticated to do this')
        return
      }
      if (!req.params.id) {
        res.status(403).send('Cant delete from null')
        return
      }
      const deleteOne = await CodeReview.destroy({
        where: {
          studentInstanceId: req.body.reviewer,
          reviewNumber: req.body.codeReviewRound
        }
      })
      if (deleteOne === 1) {
        res.status(200).send({
          message: 'Code review link removed successfully',
          data: req.body
        })
      }
      return
    } catch (e) {
      res.status(500).send({
        message: e
      })
    }
  }
}
