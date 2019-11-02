const Sequelize = require('sequelize')
const request = require('request')
const db = require('../models')
const helper = require('../helpers/courseInstanceHelper')
const logger = require('../utils/logger')

const { Op } = Sequelize
const { User, CourseInstance, StudentInstance, TeacherInstance, Week, CodeReview, Comment, Tag, Checklist, ChecklistItem } = db

const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]

const overkillLogging = (req, error) => {
  logger.debug('request: ', req)
  logger.error('error: ', error)
}

const validationErrorMessages = {
  github: 'Github repository link is not a proper url.',
  projectName: 'Project name contains illegal characters.\nCharacters allowed'
    + 'are letters from a-ö, numbers, apostrophe, - and whitespace'
    + '(not multiple in a row or at first/last character)'
}

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  async findByUserTeacherInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      await CourseInstance.findAll({
        include: [{
          model: TeacherInstance,
          required: true,
          where: { userId: req.decoded.id },
          as: 'teachercourseInstances'
        }]
      }).then(courseInstances => res.status(200).send(courseInstances))
        .catch((error) => {
          logger.error(error)
          res.status(400).send(error)
        })
    }
  },

  /**
   * Gets courses of a user who has the studentInstance with id=req.params.id
   * @param {*} req
   * @param {*} res
   */
  async findByStudentInstanceId(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      const studentInstance = await StudentInstance.findOne({
        where: { id: req.params.id } // id is StudentInstance.id
      })
      await CourseInstance.findAll({
        include: [{
          model: StudentInstance,
          required: true,
          where: { userId: studentInstance.userId },
          as: 'courseInstances'
        }]
      }).then(courseInstances => res.status(200).send(courseInstances))
        .catch((error) => {
          logger.error(error)
          res.status(400).send(error)
        })
    }
  },
  /**
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async coursePage(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.body.course
      }
    })
    const courseInst = course.id
    const palautus = {
      role: 'Unregistered',
      data: undefined
    }
    const user = req.decoded.id
    const isTeacher = await helper.getTeacherId(user, courseInst)
    if (!isTeacher) {
      const student = await StudentInstance.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          userId: user,
          courseInstanceId: courseInst
        },
        include: [
          {
            model: Week,
            attributes: {
              exclude: ['updatedAt', 'instructorNotes']
            },
            as: 'weeks',
            include: [
              {
                model: Comment,
                attributes: {
                  exclude: ['updatedAt']
                },
                as: 'comments',
                where: {
                  hidden: false
                },
                required: false
              }
            ]
          },
          {
            model: CodeReview,
            attributes: ['toReview', 'reviewNumber', 'points', 'linkToReview', 'repoToReview'],
            as: 'codeReviews',
            where: {
              [Op.or]: [
                {
                  reviewNumber: {
                    [Op.in]: course.currentCodeReview
                  }
                },
                {
                  points: {
                    [Op.ne]: null
                  }
                }
              ]
            },
            required: false,
            include: [
              {
                model: StudentInstance,
                attributes: ['github', 'projectName'],
                as: 'toReviews'
              }
            ]
          },
          {
            model: User,
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            }
          }
        ]
      })

      try {
        if (student) {
          palautus.data = student.dataValues
          // Here we splice together the codeReviews field
          if (palautus.data.codeReviews) {
            palautus.data.codeReviews = palautus.data.codeReviews.map(cr => cr.dataValues)
            palautus.data.codeReviews = palautus.data.codeReviews.map(cr => ({
              toReview: {
                github: cr.toReviews ? cr.toReviews.github : null,
                projectName: cr.toReviews ? cr.toReviews.projectName : null
              },
              reviewNumber: cr.reviewNumber,
              points: cr.points,
              linkToReview: cr.linkToReview,
              repoToReview: cr.repoToReview
            })
            )
            // This was only ever included to be spliced into the codeReviews filed above.
            delete palautus.data.toReviews
          }
        } else {
          palautus.data = null
        }

        palautus.role = 'student'
        res.status(200).send(palautus)
      } catch (error) {
        res.status(400).send(error)
      }
    } else {
      const teacherPalautus = await StudentInstance.findAll({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          courseInstanceId: courseInst
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
                  exclude: ['updatedAt']
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
        ],
        order: [
          [
            { model: CodeReview, as: 'codeReviews' },
            'reviewNumber', 'ASC'
          ]
        ]
      })
      try {
        palautus.data = teacherPalautus
        palautus.role = 'teacher'
        res.status(200).send(palautus)
      } catch (e) {
        res.status(200).send(e)
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   */
  findByUserStudentInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    helper.findByUserStudentInstance(req, res)
  },

  /**
   *
   * @param req
   * @param res
   */
  async registerToCourseInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    const course = await CourseInstance.findOne({
      where: {
        ohid: req.params.ohid
      }
    })
    if (!course) {
      overkillLogging(req, null)
      return res.status(400).send({
        message: 'course instance not found'
      })
    }
    if (course.active === false) {
      logger.info('course registration failed because course is not active')
      overkillLogging(req, null)
      return res.status(400).send({
        message: 'course is not active'
      })
    }
    const user = await User.findById(req.decoded.id)
    if (!user) {
      overkillLogging(req, null)
      return res.status(400).send({
        message: 'User could not be found.'
      })
    }
    const webOodiStatus = await new Promise((resolve) => {
      helper.checkWebOodi(req, res, user, resolve) // this does not work.

      setTimeout(() => {
        overkillLogging(req, null)
        resolve('shitaintright') // Yay! everything went to hell.
      }, 5000) // set a high timeout value since you really want to wait x)
    })

    if (webOodiStatus !== 'found') {
      overkillLogging(req, null)
      return res.status(403).json({
        message: 'You have not yet registered to this course at WebOodi. If you have already registered at WebOodi, try again in two hours.'
      })
    }
    let student
    try {
      student = await StudentInstance.findOrCreate({
        where: {
          userId: user.id,
          courseInstanceId: course.dataValues.id
        },
        defaults: {
          userId: user.id,
          name: user,
          courseInstanceId: course.dataValues.id,
          // model would like to validate this to be an URL but seems like crap
          github: req.body.github || '',
          // model would like to validate this to alphanumeric but seems like this needs specific nulls or empties or whatever
          projectName: req.body.projectName || ''
        }
      })
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errorMessage = error.errors.map(e => validationErrorMessages[e.path] || 'Unknown validation error.')
        return res.status(400).json({
          message: errorMessage.join('\n')
        })
      }
      overkillLogging(req, error)
      return res.status(500).json({
        message: 'Unexpected error.'
      })
    }
    if (!student) {
      overkillLogging(req, null)
      res.status(400).json({
        message: 'Student record could not be found or created.'
      })
    } else {
      helper.findByUserStudentInstance(req, res)
      return res.status(200).json(student)
    }
  },

  /**
   * req.body: {
   *   ohid,
   *   studentInstances: [
   *     {
   *       userId,
   *       dropped,
   *       ....
   *     }
   *   ]
   * }
   */
  massUpdateStudentInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      CourseInstance.findOne({
        ohid: req.body.ohid
      }).then(course => {
        if (!course) {
          res.status(404).send('course not found')
          return
        }

        const currentTime = new Date()

        Promise.all(req.body.studentInstances.map(studentInstance => {
          return helper.checkHasPermissionToViewStudentInstance(req, course.id, studentInstance.userId).then(isAllowedToUpdate => {
            if (isAllowedToUpdate) {
              const newStudentInstance = {}
              if (studentInstance.github) {
                newStudentInstance.github = studentInstance
              }
              if (studentInstance.projectName) {
                newStudentInstance.projectName = studentInstance.projectName
              }
              if ('dropped' in studentInstance) {
                newStudentInstance.dropped = studentInstance.dropped
              }
              if ('issuesDisabled' in studentInstance) {
                newStudentInstance.issuesDisabled = studentInstance.issuesDisabled
                newStudentInstance.issuesDisabledCheckedAt = currentTime.toISOString()
              }

              return StudentInstance.update(newStudentInstance, 
              { returning: true,
                where: {
                  userId: studentInstance.userId,
                  courseInstanceId: course.id
                }
              }).then(([ _, [updatedStudentInstance]]) => updatedStudentInstance)
            } else {
              return Promise.resolve()
            }
          })
        })).then(updatedStudents => {
          res.status(200).send(updatedStudents.filter(updatedStudent => !!updatedStudent).map(({ dataValues }) => dataValues))
        }).catch(error => {
          logger.error(error)
          res.status(400).send(error)
        })
      }).catch(error => {
        logger.error(error)
        res.status(400).send(error)
      })
    } catch (e) {
      logger.error(e)
      res.status(400).send(e)
    }
  },

  /**
   * req.body:
   *    {
   *      userId, //Only required if updating student instance of other user than the currently logged in
   *      github,
   *      projectname,
   *      dropped
   *    }
   */
  updateStudentInstance(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    try {
      if (req.authenticated.success) {
        const userId = req.body.userId || req.decoded.id

        CourseInstance.findOne({
          where: {
            ohid: req.body.ohid
          }
        })
          .then((course) => {
            if (!course) {
              res.status(404).send('course not found')
              return
            }
            helper.checkHasPermissionToViewStudentInstance(req, course.id, userId).then((isAllowedToUpdate) => {
              if (!isAllowedToUpdate) {
                res.status(401).send(`Not allowed to update student instance for user ${userId}`)
              }
            })
            StudentInstance.find({
              where: {
                userId,
                courseInstanceId: course.id
              }
            }).then((targetStudent) => {
              if (!targetStudent) {
                res.status(404).send('Student not found')
                return
              }
              targetStudent
                .update({
                  github: req.body.github || targetStudent.github,
                  projectName: req.body.projectname || targetStudent.projectName,
                  dropped: 'dropped' in req.body ? req.body.dropped : targetStudent.dropped,
                  issuesDisabled: 'issuesDisabled' in req.body ? req.body.issuesDisabled : targetStudent.issuesDisabled,
                  issuesDisabledCheckedAt: 'issuesDisabled' in req.body ? new Date().toISOString() : targetStudent.issuesDisabledCheckedAt
                })
                .then((updatedStudentInstance) => {
                  res.status(200).send(updatedStudentInstance)
                })
                .catch((error) => {
                  if (error.name === 'SequelizeValidationError') {
                    const errorMessage = error.errors.map(
                      e => validationErrorMessages[e.path] || 'Unknown validation error.')
                    logger.error(error)
                    return res.status(400).send({ message: errorMessage.join('\n') })
                  }
                })
            })
          })
          .catch((error) => {
            logger.error(error)
            res.status(400).send('\n\n\n\ntuli joku error: ', error)
          })
      }
    } catch (e) {
      logger.error(e)
      res.status(400).send(e)
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  update(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    CourseInstance.findOne({
      where: {
        ohid: req.params.id
      }
    })
      .then((courseInstance) => {
        if (!courseInstance) {
          res.status(400).send({
            message: 'course instance not found'
          })
          return
        }
        TeacherInstance.findOne({
          where: {
            userId: req.decoded.id,
            courseInstanceId: courseInstance.id
          }
        })
          .then((teacher) => {
            if (!teacher || !req.authenticated.success) {
              res.status(400).send('You have to be a teacher to update course info')
              return
            }
            courseInstance
              .update({
                name: req.body.name || courseInstance.name,
                start: req.body.start || courseInstance.start,
                end: req.body.end || courseInstance.end,
                // Without stringifying req.body.active this gets interpreted as a boolean operation. Go javascript.
                active: String(req.body.active) || courseInstance.active,
                weekAmount: req.body.weekAmount || courseInstance.weekAmount,
                weekMaxPoints: req.body.weekMaxPoints || courseInstance.weekMaxPoints,
                currentWeek: req.body.currentWeek || courseInstance.currentWeek,
                finalReview: req.body.finalReview,
                currentCodeReview: req.body.newCr.length === 0 ? '{}' : req.body.newCr,
                coursesPage: typeof req.body.coursesPage === 'string' ? req.body.coursesPage : courseInstance.coursesPage,
                courseMaterial: typeof req.body.courseMaterial === 'string' ? req.body.courseMaterial : courseInstance.courseMaterial
              })
              .then(updatedCourseInstance => res.status(200).send(updatedCourseInstance))
              .catch((error) => {
                res.status(400).send(error)
                logger.error(error)
              })
          })
          .catch((error) => {
            res.status(400).send(error)
            logger.error(error)
          })
      })
      .catch((error) => {
        res.status(400).send(error)
        logger.error(error)
      })
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  list(req, res) {
    return CourseInstance.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })
      .then(instance => res.status(200).send(instance))
      .catch((error) => {
        logger.error(error)
        res.status(400).send(error)
      })
  },

  /**
   *
   * @param req
   * @param res
   */
  retrieve(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    CourseInstance.find(
      {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          ohid: req.params.ohid
        }
      },
      {}
    )
      .then((courseInstance) => {
        if (!courseInstance) {
          return res.status(404).send({
            message: 'Course not Found'
          })
        }
        return res.status(200).send(courseInstance)
      })
      .catch((error) => {
        logger.error(error)
        res.status(400).send(error)
      })
  },
  /**
   *
   * @param req
   * @param res
   */
  getNew(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    const termAndYear = helper.CurrentTermAndYear()
    if (this.remoteAddress === '127.0.0.1') {
      res.send('gtfo')
    } else {
      const options = {
        method: 'get',
        uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.currentYear}&term=${termAndYear.currentTerm}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.TOKEN
        },
        strictSSL: false
      }
      request(options, (err, resp, body) => {
        const json = JSON.parse(body)
        if (!json.forEach) {
          logger.error(json)
          return
        }
        json.forEach((instance) => {
          CourseInstance.findOrCreate({
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            },
            where: { ohid: instance.id },
            defaults: {
              name: instance.name,
              start: instance.starts,
              end: instance.ends,
              ohid: instance.id
            }
          })
        })
        if (req.decoded) {
          res.status(204).send({ hello: 'hello' }) // nodejs crashes if someone just posts here without valid token.
        }
      })
    }
  },

  /**
   *
   * @param req
   * @param res
   */
  getNewer(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    const auth = process.env.TOKEN || 'notset' // You have to set TOKEN in .env file in order for this to work
    const termAndYear = helper.CurrentTermAndYear()
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else if (this.remoteAddress === '127.0.0.1') {
      res.send('gtfo')
    } else {
      const options = {
        method: 'get',
        uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.nextYear}&term=${termAndYear.nextTerm}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.TOKEN
        },
        strictSSL: false
      }
      request(options, (err, resp, body) => {
        const json = JSON.parse(body)
        json.forEach((instance) => {
          CourseInstance.findOrCreate({
            attributes: {
              exclude: ['createdAt', 'updatedAt']
            },
            where: { ohid: instance.id },
            defaults: {
              name: instance.name,
              start: instance.starts,
              end: instance.ends,
              ohid: instance.id
            }
          })
        })
        if (req.decoded) {
          res.status(204).send({ hello: 'hello' }) // nodejs crashes if someone just posts here without valid token.
        }
      })
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Model>}
   */
  async retrieveCourseStuff(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      try {
        const currentUser = await User.findById(req.decoded.id)

        if (!currentUser) {
          return res.status(404).send('User not found')
        }

        const checkRegistrationStatus = new Promise((resolve, _reject) => {
          helper.checkWebOodi(req, res, currentUser, resolve)
          setTimeout(() => {
            resolve('failure')
          }, 5000)
        })

        const registrationAtWebOodi = await checkRegistrationStatus

        const course = await CourseInstance.findOne({
          where: {
            ohid: req.params.ohid
          }
        })

        if (!course) {
          return res.status(404).send('Course not found')
        }

        const teachers = await TeacherInstance.findAll({
          where: {
            courseInstanceId: course.id
          }
        })

        const names = {}
        const users = await User.findAll()
        users.forEach((user) => {
          names[user.id] = {
            firsts: user.firsts,
            lastname: user.lastname
          }
        })

        for (const i in Object.keys(teachers)) {
          const teacher = teachers[i]
          teacher.dataValues.firsts = names[teacher.userId].firsts
          teacher.dataValues.lastname = names[teacher.userId].lastname
        }

        const checklists = await Checklist.findAll({
          where: {
            courseInstanceId: course.id
          }
        })
        //Add checklist items to checklists
        for (const checklist of checklists) {
          const checklistJson = {}
          const checklistItems = await ChecklistItem.findAll({ where: {
            checklistId: checklist.id 
          }})
          checklistItems.forEach(({ dataValues: checklistItem }) => {
            if (checklistJson[checklistItem.category] === undefined) {
              checklistJson[checklistItem.category] = []
            }
            
            const checklistItemCopy = { ...checklistItem }
            delete checklistItemCopy.category
            delete checklistItemCopy.checklistId
            checklistJson[checklistItem.category].push(checklistItemCopy)
          })

          checklist.dataValues.list = checklistJson
        }

        course.dataValues.teacherInstances = teachers
        course.dataValues.registrationAtWebOodi = registrationAtWebOodi
        course.dataValues.checklists = checklists

        return res.status(200).send(course)
      } catch (exception) {
        return res.status(400).send(exception)
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {*|Promise<T>}
   */
  async addComment(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    if (req.authenticated.success) {
      const userId = req.decoded.id
      try {
        const message = req.body

        const user = await User.findById(userId)
        if (!user) {
          res.status(400).send('you are not an user in the system')
          return
        }
        const hasPermission = await helper.checkHasCommentPermission(user, message.week)
        if (!hasPermission) {
          res.status(403).send('you are not allowed to comment here')
          return
        }
        const name = user.firsts.concat(' ').concat(user.lastname)

        if (message.comment.trim().length === 0) {
          res.status(400).send('comment cannot be empty')
          return
        }

        const comment = await Comment.create({
          weekId: message.week,
          hidden: message.hidden,
          comment: message.comment,
          from: name,
          notified: false
        })

        if (!comment) {
          res.status(400).send('week not found')
        } else {
          res.status(200).send(comment)
        }
      } catch (e) {
        res.status(400).send(e)
        logger.error(e)
      }
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Array<Model>>}
   */
  getCommentsForWeek(req, res) {
    if (!helper.controllerBeforeAuthCheckAction(req, res)) {
      return
    }

    return Comment.findAll({
      attributes: {
        exclude: ['updatedAt']
      },
      where: {
        weekId: req.body.week
      }
    })
      .then(comment => res.status(200).send(comment))
      .catch((error) => {
        res.status(400).send(error)
        logger.error(error)
      })
  }
}
