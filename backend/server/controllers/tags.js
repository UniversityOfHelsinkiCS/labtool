const { Tag, StudentTag, TeacherInstance, StudentInstance, Week, User, Comment, CodeReview } = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../../server/utils/logger')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  async createOrUpdate(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      const teacher = await TeacherInstance.findOne({
        where: {
          userId: req.decoded.id
        }
      })
      if (!teacher) {
        res.status(400).send('You need to be a teacher to do this.')
        return
      }

      const tag = await Tag.findOrCreate({
        where: {
          name: req.body.text
        }
      })

      const text = req.body.newText ? req.body.newText : tag[0].text
      const newTag = await Tag.update(
        {
          color: req.body.color || 'gray',
          name: text
        },
        {
          where: {
            id: tag[0].id
          },
          returning: true,
          plain: true
        }
      )
      res.status(200).send(newTag[1])
    } catch (e) {
      res.status(400).send(e)
    }
  },

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
        return res.status(400).send('you have to be a course teacher to do this')
      }

      const tag = await Tag.findOne({
        where: {
          name: req.body.text
        }
      })
      if (!tag) {
        return res.status(404).send('there is no tag with that name')
      }

      const { id } = tag
      await tag.destroy()
      return res.status(200).send(id.toString())
    } catch (e) {
      return res.status(400).send(e)
    }
  },

  getAll(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      return Tag.findAll()
        .then(tag => res.status(200).send(tag))
        .catch((error) => {
          res.status(400).send('et ny saa niitä tageja')
          logger.error('tag getall error', { error: error.message })
        })
    } catch (e) {
      res.status(400).send('nymmeni jokin pieleen')
    }
  },

  async addTagToStudentInstance(req, res) {
    if (req.body.tagId) {
      if (!helper.controllerBeforeAuthCheckAction(req, res)) {
        return
      }

      try {
        const teacher = await TeacherInstance.findOne({
          where: {
            userId: req.decoded.id
          }
        })
        if (!teacher) {
          res.status(400).send('you have to be a teacher to do this')
          return
        }

        const student = await StudentInstance.findOne({
          where: {
            id: req.body.studentId
          }
        })
        if (!student) {
          res.status(404).send('did not found student with that id')
          return
        }

        const foundTag = await Tag.findOne({
          where: {
            id: req.body.tagId
          }
        })
        if (!foundTag) {
          res.status(404).send('did not find a tag with that id')
          return
        }

        const studentTag = await StudentTag.findOrCreate({
          where: {
            tagId: req.body.tagId,
            studentInstanceId: req.body.studentId
          }
        })
        if (!studentTag) {
          res.status(400).send('tagging did not succeed')
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
        res.status(400).send('ei onnistu')
      }
    } else {
      res.status(400).send('no tag selected')
    }
  },

  async removeTagFromStudentInstance(req, res) {
    if (req.body.tagId) {
      if (!helper.controllerBeforeAuthCheckAction(req, res)) {
        return
      }

      try {
        const teacher = await TeacherInstance.findOne({
          where: {
            userId: req.decoded.id
          }
        })
        if (!teacher) {
          res.status(400).send('you have to be a teacher to do this')
          return
        }

        const studentTag = await StudentTag.findOne({
          where: {
            studentInstanceId: req.body.studentId,
            tagId: req.body.tagId
          }
        })
        if (!studentTag) {
          res.status(404).send('did not find the given student tag')
        }

        const removedTag = await studentTag.destroy()
        if (!removedTag) {
          return res.status(400).send('removing student tag failed')
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
        res.status(400).send('ei onnistu')
      }
    } else {
      res.status(400).send('no tag selected')
    }
  }
}
