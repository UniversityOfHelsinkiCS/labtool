const { Tag, StudentTag, TeacherInstance, StudentInstance, CourseInstance, Week, User, Comment, CodeReview } = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../../server/utils/logger')

module.exports = {
  /**
   * Creates or edits a tag
   *   permissions: must be an instructor on any course for global tag,
   *     or on the specific course for a given course
   *
   * @param req
   * @param res
   */
  async createOrUpdate(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      const whereTeacher = {
        userId: req.decoded.id
      }
      if (req.body.courseInstanceId) {
        whereTeacher.courseInstanceId = req.body.courseInstanceId
      }
      const teacher = await TeacherInstance.findOne({
        where: whereTeacher
      })
      if (!teacher) {
        return res.status(403).send('You need to be a teacher or instructor to do this.')
      }

      const tag = {
        color: req.body.color || 'gray',
        name: req.body.text.trim(),
        courseInstanceId: req.body.courseInstanceId || null
      }

      if (tag.name.length === 0) {
        res.status(400).send('Tag name cannot be empty')
        return
      }

      if (req.body.id) {
        // find existing tag, if there is one
        const oldTag = await Tag.findOne({ where: { id: req.body.id } })
        if (tag.courseInstanceId !== null && oldTag && oldTag.courseInstanceId === null) {
          // if old tag was global, duplicate that tag to every other
          // course it was used in
          const studentTags = await StudentTag.findAll({
            where: {
              tagId: oldTag.id
            }
          })

          const students = await Promise.all(studentTags.map(st => StudentInstance.findByPk(st.studentInstanceId)))
          const studentsMap = {}
          students.forEach((student) => {
            studentsMap[student.id] = student
          })

          const courses = await Promise.all(students.map(student => CourseInstance.findByPk(student.courseInstanceId)))
          const uniqueCourseIds = [...new Set(courses.map(course => course.id))].filter(id => id !== tag.courseInstanceId)

          // go over StudentTag list by course instance ID
          await Promise.all(uniqueCourseIds.map(async (id) => {
            const theseStudentTags = studentTags.filter(st => studentsMap[st.studentInstanceId].courseInstanceId === id)
            if (theseStudentTags.length) {
              // copy the tag for this course, then
              const copyTag = await Tag.create({
                ...tag,
                courseInstanceId: id
              })

              // update all student tag instances
              await Promise.all(theseStudentTags.map(st => StudentTag.update(
                {
                  tagId: copyTag.id
                },
                {
                  where: {
                    id: st.id
                  }
                }
              )
              ))
            }
          }))
        } else if (tag.courseInstanceId === null && oldTag && oldTag.courseInstanceId !== null) {
          // converting to a global tag
          // if there already is a global tag with the same name and color,
          // merge the two tags (the existing global tag stays)

          const mergeTag = await Tag.findOne({ where: {
            name: tag.name,
            color: tag.color,
            courseInstanceId: null
          } })

          if (mergeTag) {
            await StudentTag.update(
              {
                tagId: mergeTag.id
              },
              {
                where: {
                  tagId: oldTag.id
                }
              }
            )

            await oldTag.destroy()
            return res.status(200).send({
              id: mergeTag.id,
              name: mergeTag.name,
              color: mergeTag.color,
              courseInstanceId: null,
              deleteId: oldTag.id
            })
          }
        }
      }



      if (req.body.id) {
        const newTag = await Tag.update(
          tag,
          {
            where: {
              id: req.body.id
            },
            returning: true,
            plain: true
          }
        )

        res.status(200).send(newTag[1].dataValues)
      } else {
        const existingTag = await Tag.findOne({
          where: {
            courseInstanceId: tag.courseInstanceId ? tag.courseInstanceId : null,
            name: tag.name
          }
        })

        if (existingTag) {
          res.status(400).send(`Tag ${tag.name} already exists`)
          return
        } else {
          const newTag = await Tag.create(
            tag,
            {
              returning: true,
              plain: true
            }
          )
          res.status(200).send(newTag)
        }
      }
    } catch (e) {
      console.error(e)
      res.status(400).send(e)
    }
  },

  /**
   * Removes a tag
   *   permissions: must be an instructor on any course for global tag
   *     or on the specific course for a course tag
   *
   * @param req
   * @param res
   */
  async remove(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      const tag = await Tag.findOne({
        where: {
          id: req.body.id
        }
      })
      if (!tag) {
        return res.status(404).send('There is no tag with that ID.')
      }

      const whereTeacher = {
        userId: req.decoded.id
      }
      if (tag.courseInstanceId) {
        whereTeacher.courseInstanceId = tag.courseInstanceId
      }
      const teacher = await TeacherInstance.findOne({
        where: whereTeacher
      })
      if (!teacher) {
        return res.status(400).send('You have to be a teacher or instructor to do this.')
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
          return res.status(400).send('Did not found student with that ID.')
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
          return res.status(400).send('Did not find a tag with that ID.')
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
          return res.status(400).send('did not found student with that id')
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
          res.status(400).send('Did not find the given student tag.')
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
