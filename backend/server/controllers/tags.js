const Tag = require('../models').Tag
const StudentTag = require('../models').StudentTag
const TeacherInstance = require('../models').TeacherInstance
const StudentInstance = require('../models').StudentInstance
const Week = require('../models').Week
const User = require('../models').User
const Comment = require('../models').Comment
const CodeReview = require('../models').CodeReview
const helper = require('../helpers/course_instance_helper')
const logger = require('../../server/utils/logger')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  createOrUpdate(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      TeacherInstance.findOne({
        where: {
          userId: req.decoded.id
        }
      }).then(teacher => {
        if (!teacher) {
          res.status(400).send('You need to be a teacher to do this.')
          return
        }
        Tag.findOrCreate({
          where: {
            name: req.body.text
          }
        }).then(tag => {
          const text = req.body.newText ? req.body.newText : tag[0].text
          Tag.update(
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
            .then(tag => {
              res.status(200).send(tag[1])
              return
            })
            .catch(error => {
              logger.error(error)
              res.status(400).send('color did not update')
              return
            })
        })
      })
    } catch (e) {
      res.status(400).send(e)
    }
  },

  remove(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      TeacherInstance.findOne({
        where: {
          userId: req.decoded.id,
          admin: true
        }
      }).then(found => {
        if (!found) {
          return res.status(400).send('you have to be a course teacher to do this')
        }
        Tag.findOne({
          where: {
            name: req.body.text
          }
        }).then(tag => {
          if (!tag) {
            return res.status(404).send('there is no tag with that name')
          }
          const id = tag.id
          tag.destroy()
          return res.status(200).send(id.toString())
        })
      })
    } catch (e) {
      return res.status(400).send(e)
    }
  },

  getAll(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      return Tag.findAll()
        .then(tag => {
          return res.status(200).send(tag)
        })
        .catch(error => {
          res.status(400).send('et ny saa niitä tageja')
          logger.error(error)
        })
    } catch (e) {
      res.status(400).send('nymmeni jokin pieleen')
      return
    }
  },

  addTagToStudentInstance(req, res) {
    if (req.body.tagId) {
      helper.controller_before_auth_check_action(req, res)
      try {
        TeacherInstance.findOne({
          where: {
            userId: req.decoded.id
          }
        }).then(found => {
          if (!found) {
            res.status(400).send('you have to be a teacher to do this')
            return
          }
          StudentInstance.findOne({
            where: {
              id: req.body.studentId
            }
          }).then(student => {
            if (!student) {
              res.status(404).send('did not found student with that id')
              return
            }
            Tag.findOne({
              where: {
                id: req.body.tagId
              }
            }).then(found => {
              if (!found) {
                res.status(404).send('did not find a tag with that id')
              }
              StudentTag.findOrCreate({
                where: {
                  tagId: req.body.tagId,
                  studentInstanceId: req.body.studentId
                }
              }).then(studentTag => {
                if (!studentTag) {
                  return res.status(400).send('tagging did not succeed')
                }

                StudentInstance.findOne({
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
                }).then(student => {
                  return res.status(200).send(student)
                })
              })
            })
          })
        })
      } catch (e) {
        res.status(400).send('ei onnistu')
      }
    } else {
      res.status(400).send('no tag selected')
    }
  },

  removeTagFromStudentInstance(req, res) {
    if (req.body.tagId) {
      helper.controller_before_auth_check_action(req, res)
      try {
        TeacherInstance.findOne({
          where: {
            userId: req.decoded.id
          }
        }).then(found => {
          if (!found) {
            res.status(400).send('you have to be a teacher to do this')
            return
          }
          StudentTag.findOne({
            where: {
              studentInstanceId: req.body.studentId,
              tagId: req.body.tagId
            }
          }).then(studentTag => {
            if (!studentTag) {
              res.status(404).send('did not find the given student tag')
            }
            studentTag.destroy().then(removedTag => {
              if (!removedTag) {
                return res.status(400).send('removing student tag failed')
              }
              StudentInstance.findOne({
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
              }).then(student => {
                return res.status(200).send(student)
              })
            })
          })
        })
      } catch (e) {
        res.status(400).send('ei onnistu')
      }
    } else {
      res.status(400).send('no tag selected')
    }
  }
}
