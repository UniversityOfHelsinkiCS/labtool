const { Tag, StudentTag, TeacherInstance, StudentInstance, Week, User, Comment, CodeReview } = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../../server/utils/logger')

module.exports = {
  /**
   * Creates or edits a tag
   *   permissions: must be an instructor on any course
   *
   * @param req
   * @param res
   */
  async createOrUpdate(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      console.log('createOrUpdate')
      const teacher = await TeacherInstance.findOne({
        where: {
          userId: req.decoded.id
        }
      })
      if (!teacher) {
        return res.status(400).send('You need to be a teacher or instructor to do this.')
      }

      const tag = {
        color: req.body.color || 'gray',
        name: req.body.text,
        courseInstanceId: req.body.courseInstanceId || null
      }

      const newTag = req.body.id ? (await Tag.update(
        tag,
        {
          where: {
            id: req.body.id
          },
          returning: true,
          plain: true
        }
      ))[1] : await Tag.create(
        tag,
        {
          returning: true,
          plain: true
        }
      )
      res.status(200).send(newTag)
    } catch (e) {
      res.status(400).send(e)
    }
  },

  /**
   * Removes a tag
   *   permissions: must be a *course teacher* on any course
   *
   * @param req
   * @param res
   */
  async remove(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      const teacher = await TeacherInstance.findOne({
        where: {
          userId: req.decoded.id,
          instructor: false
        }
      })
      if (!teacher) {
        return res.status(400).send('You have to be a course teacher to do this.')
      }

      const tag = await Tag.findOne({
        where: {
          id: req.body.id
        }
      })
      if (!tag) {
        return res.status(404).send('There is no tag with that name.')
      }

      const { id } = tag
      await tag.destroy()
      return res.status(200).send(id.toString())
    } catch (e) {
      return res.status(400).send(e)
    }
  },

  /**
   * Get all tags
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  getAll(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      return Tag.findAll()
        .then(tag => res.status(200).send(tag))
        .catch((error) => {
          res.status(400).send('Error fetching tags.')
          logger.error('Couldn\'t fetch tags.', { error: error.message })
        })
    } catch (e) {
      res.status(400).send('An error occurred. Please try again.')
    }
  },

  /**
   * Add tag to a student
   *   permissions: must be a teacher/instructor on the course of that student
   *
   * @param req
   * @param res
   */
  async addTagToStudentInstance(req, res) {
    if (req.body.tagId) {
      if (!helper.controllerBeforeAuthCheckAction(req, res)) {
        return
      }

      try {
        const student = await StudentInstance.findOne({
          where: {
            id: req.body.studentId
          }
        })
        if (!student) {
          return res.status(404).send('Did not found student with that ID.')
        }

        const teacher = await TeacherInstance.findOne({
          where: {
            userId: req.decoded.id,
            courseInstanceId: student.courseInstanceId
          }
        })
        if (!teacher) {
          return res.status(400).send('You have to be a teacher to do this.')
        }

        const foundTag = await Tag.findOne({
          where: {
            id: req.body.tagId
          }
        })
        if (!foundTag) {
          return res.status(404).send('Did not find a tag with that ID.')
        }

        const studentTag = await StudentTag.findOrCreate({
          where: {
            tagId: req.body.tagId,
            studentInstanceId: req.body.studentId
          }
        })
        if (!studentTag) {
          res.status(400).send('Tagging did not succeed.')
          return
        }

        const newStudent = await StudentInstance.findOne({
          where: {
            id: req.body.studentId
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: [
            {
              model: Week,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              },
              as: 'weeks',
              include: [
                {
                  model: Comment,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt']
                  },
                  as: 'comments'
                }
              ]
            },
            {
              model: CodeReview,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              },
              as: 'codeReviews'
            },
            {
              model: User,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: Tag,
              attributes: ['id', 'name', 'color']
            }
          ]
        })
        res.status(200).send(newStudent)
      } catch (e) {
        res.status(400).send('An unknown error occurred. Please try again.')
      }
    } else {
      res.status(400).send('No tag selected.')
    }
  },

  /**
   * Remove tag from a student
   *   permissions: must be a teacher/instructor on the course of that student
   *
   * @param req
   * @param res
   */
  async removeTagFromStudentInstance(req, res) {
    if (req.body.tagId) {
      if (!helper.controllerBeforeAuthCheckAction(req, res)) {
        return
      }

      try {
        const student = await StudentInstance.findOne({
          where: {
            id: req.body.studentId
          }
        })
        if (!student) {
          return res.status(404).send('did not found student with that id')
        }

        const teacher = await TeacherInstance.findOne({
          where: {
            userId: req.decoded.id,
            courseInstanceId: student.courseInstanceId
          }
        })
        if (!teacher) {
          return res.status(400).send('You have to be a teacher to do this.')
        }

        const studentTag = await StudentTag.findOne({
          where: {
            studentInstanceId: req.body.studentId,
            tagId: req.body.tagId
          }
        })
        if (!studentTag) {
          res.status(404).send('Did not find the given student tag.')
        }

        const removedTag = await studentTag.destroy()
        if (!removedTag) {
          return res.status(400).send('Removing student tag failed.')
        }

        const newStudent = await StudentInstance.findOne({
          where: {
            id: req.body.studentId
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          },
          include: [
            {
              model: Week,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              },
              as: 'weeks',
              include: [
                {
                  model: Comment,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt']
                  },
                  as: 'comments'
                }
              ]
            },
            {
              model: CodeReview,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              },
              as: 'codeReviews'
            },
            {
              model: User,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              }
            },
            {
              model: Tag,
              attributes: ['id', 'name', 'color']
            }
          ]
        })
        res.status(200).send(newStudent)
      } catch (e) {
        res.status(400).send('An unknown error occurred. Please try again.')
      }
    } else {
      res.status(400).send('No tag selected.')
    }
  }
}
