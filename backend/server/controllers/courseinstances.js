const db = require('../models')
const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const User = require('../models').User
const helper = require('../helpers/course_instance_helper')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const StudentInstanceController = require('../controllers').studentInstances
const Week = require('../models').Week
const CodeReview = require('../models').CodeReview
const Comment = require('../models').Comment
const Tag = require('../models').Tag
const Checklist = require('../models').Checklist
const env = process.env.NODE_ENV || 'development'
const config = require('./../config/config.js')[env]
const logger = require('../utils/logger')

const overkillLogging = (req, error) => {
  console.log('request: ', req)
  console.log('error: ', error)
}

const validationErrorMessages = {
  github: 'Github repository link is not a proper url.',
  projectName: 'Project name contains illegal characters.\nCharacters allowed are letters from a-ö, numbers, apostrophe, - and whitespace (not multiple in a row or at first/last character)'
}

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  findByUserTeacherInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)
    const errors = []

    const id = parseInt(req.body.userId) //TODO: CHECK THAT THIS IS SANITICED ID
    db.sequelize
      .query(`SELECT * FROM "CourseInstances" JOIN "TeacherInstances" ON "CourseInstances"."id" = "TeacherInstances"."courseInstanceId" WHERE "TeacherInstances"."userId" = ${req.decoded.id}`)
      .then(instance => res.status(200).send(instance[0]))
      .catch((error) => {
        logger.error(error)
        res.status(400).send(error)
      })
  },
  /**
   *
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async coursePage(req, res) {
    helper.controller_before_auth_check_action(req, res)
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
    const teacher = await TeacherInstance.findAll({
      where: {
        userId: user,
        courseInstanceId: courseInst
      }
    })
    if (teacher[0] === undefined) {
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
              exclude: ['updatedAt']
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
            attributes: ['toReview', 'reviewNumber', 'points', 'linkToReview'],
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
            model: CodeReview,
            attributes: ['studentInstanceId', 'reviewNumber'],
            as: 'toReviews',
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
                as: 'codeReviews'
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
            const reviewers = {} // Map reviewers here using the reviewNumber as a key.
            palautus.data.toReviews.forEach(cr => {
              reviewers[cr.dataValues.reviewNumber] = {
                github: cr.dataValues.codeReviews.github,
                projectName: cr.dataValues.codeReviews.projectName
              }
            })
            palautus.data.codeReviews = palautus.data.codeReviews.map(cr => cr.dataValues)
            palautus.data.codeReviews = palautus.data.codeReviews.map(cr => {
              // Replace the CodeReview rows from the database with a more user-friendly representation.
              return {
                toReview: {
                  github: cr.toReviews.github,
                  projectName: cr.toReviews.projectName
                },
                reviewNumber: cr.reviewNumber,
                points: cr.points,
                linkToReview: cr.linkToReview,
                reviewer: reviewers[cr.reviewNumber]
              }
            })
            delete palautus.data.toReviews // This was only ever included to be spliced into the codeReviews filed above.
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
    helper.controller_before_auth_check_action(req, res)
    helper.findByUserStudentInstance(req, res)
  },

  /**
   *
   * @param req
   * @param res
   */
  async registerToCourseInstance(req, res) {
    await helper.controller_before_auth_check_action(req, res)

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
      console.log('course is not active')
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

      setTimeout(function() {
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
          github: req.body.github || '', // model would like to validate this to be an URL but seems like crap
          projectName: req.body.projectName || '' // model would like to validate this to alphanumeric but seems like this needs specific nulls or empties or whatever
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
    }
  },

  /**
   * req.body:
   *    {
   *      github,
   *      projectname
   *    }
   */
  updateStudentInstance(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      if (req.authenticated.success) {
        console.log('\nauth success\n')
        CourseInstance.findOne({
          where: {
            ohid: req.body.ohid
          }
        })
          .then(course => {
            if (!course) {
              console.log('\nkurssia ei löytynyt\n')
              res.status(404).send('course not found')
              return
            }
            console.log('\nkurssi löytyi\n')
            StudentInstance.find({
              where: {
                userId: req.decoded.id,
                courseInstanceId: course.id
              }
            }).then(targetStudent => {
              if (!targetStudent) {
                console.log('\nopiskelijaa ei löytynyt\n')
                res.status(404).send('Student not found')
                return
              }
              console.log('\nopiskelija löytyi\n')
              return targetStudent
                .update({
                  github: req.body.github || targetStudent.github,
                  projectName: req.body.projectname || targetStudent.projectName
                })
                .then(updatedStudentInstance => {
                  console.log('\nUpdated student project info succesfully\n')
                  res.status(200).send(updatedStudentInstance)
                })
                .catch((error) => {
                  if (error.name === 'SequelizeValidationError') {
                    const errorMessage = error.errors.map(e => validationErrorMessages[e.path] || 'Unknown validation error.')
                    logger.error(error)
                    return res.status(400).send({ message: errorMessage.join('\n') })
                  }
                })
            })
          })
          .catch(error => {
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
    helper.controller_before_auth_check_action(req, res)

    CourseInstance.findOne({
      where: {
        ohid: req.params.id
      }
    })
      .then(courseInstance => {
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
          .then(teacher => {
            if (!teacher || !req.authenticated.success) {
              res.status(400).send('You have to be a teacher to update course info')
              return
            }
            courseInstance
              .update({
                name: req.body.name || courseInstance.name,
                start: req.body.start || courseInstance.start,
                end: req.body.end || courseInstance.end,
                active: String(req.body.active) || courseInstance.active, //Without stringifying req.body.active this gets interpreted as a boolean operation. Go javascript.
                weekAmount: req.body.weekAmount || courseInstance.weekAmount,
                weekMaxPoints: req.body.weekMaxPoints || courseInstance.weekMaxPoints,
                currentWeek: req.body.currentWeek || courseInstance.currentWeek,
                finalReview: req.body.finalReview,
                currentCodeReview: req.body.newCr.length === 0 ? '{}' : req.body.newCr
              })
              .then(updatedCourseInstance => res.status(200).send(updatedCourseInstance))
              .catch(error => {
                res.status(400).send(error)
                logger.error(error)
              })
          })
          .catch(error => {
            res.status(400).send(error)
            logger.error(error)
          })
      })
      .catch(error => {
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
      .catch(error => {
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
    helper.controller_before_auth_check_action(req, res)

    const errors = []
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
      .then(courseInstance => {
        if (!courseInstance) {
          return res.status(404).send({
            message: 'Course not Found'
          })
        }
        return res.status(200).send(courseInstance)
      })
      .catch(error => {
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
    helper.controller_before_auth_check_action(req, res)

    const termAndYear = helper.CurrentTermAndYear()
    if (this.remoteAddress === '127.0.0.1') {
      res.send('gtfo')
    } else {
      const request = require('request')
      const options = {
        method: 'get',
        uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.currentYear}&term=${termAndYear.currentTerm}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.TOKEN
        },
        strictSSL: false
      }
      request(options, function(err, resp, body) {
        const json = JSON.parse(body)
        json.forEach(instance => {
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
    helper.controller_before_auth_check_action(req, res)

    console.log('update next...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    const termAndYear = helper.CurrentTermAndYear()
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
        res.send('gtfo')
      } else {
        const request = require('request')
        const options = {
          method: 'get',
          uri: `${config.kurki_url}/labtool/courses?year=${termAndYear.nextYear}&term=${termAndYear.nextTerm}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.TOKEN
          },
          strictSSL: false
        }
        request(options, function(err, resp, body) {
          const json = JSON.parse(body)
          json.forEach(instance => {
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
    }
  },

  /**
   *
   * @param req
   * @param res
   * @returns {Promise<Model>}
   */
  async retrieveCourseStuff(req, res) {
    await helper.controller_before_auth_check_action(req, res)

    if (req.authenticated.success) {
      try {
        const currentUser = await User.findById(req.decoded.id)

        if (!currentUser) {
          return res.status(404).send('User not found')
        }

        let checkRegistrationStatus = new Promise((resolve, reject) => {
          helper.checkWebOodi(req, res, currentUser, resolve)
          setTimeout(function() {
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

        let teachers = await TeacherInstance.findAll({
          where: {
            courseInstanceId: course.id
          }
        })

        const names = {}
        const users = await User.findAll()
        users.forEach(user => {
          names[user.id] = {
            firsts: user.firsts,
            lastname: user.lastname
          }
        })

        teachers = teachers.map(teacher => {
          teacher.dataValues.firsts = names[teacher.userId].firsts
          teacher.dataValues.lastname = names[teacher.userId].lastname
          return teacher
        })

        let checklists = await Checklist.findAll({
          where: {
            courseInstanceId: course.id
          }
        })

        course.dataValues['teacherInstances'] = teachers
        course.dataValues['registrationAtWebOodi'] = registrationAtWebOodi
        course.dataValues['checklists'] = checklists

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
  addComment(req, res) {
    helper.controller_before_auth_check_action(req, res)

    if (req.authenticated.success) {
      try {
        const message = req.body
        User.findById(req.decoded.id).then(user => {
          if (!user) {
            res.status(400).send('you are not an user in the system')
            return
          } else {
            const name = user.firsts.concat(' ').concat(user.lastname)
            return Comment.create({
              weekId: message.week,
              hidden: message.hidden,
              comment: message.comment,
              from: name,
              notified: false
            })
              .then(comment => {
                if (!comment) {
                  res.status(400).send('week not found')
                } else {
                  res.status(200).send(comment)
                }
              })
              .catch(error => {
                res.status(400).send(error)
                logger.error(error)
              })
          }
        })
      } catch (e) {
        res.status(400).send(e)
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
    helper.controller_before_auth_check_action(req, res)

    return Comment.findAll({
      attributes: {
        exclude: ['updatedAt']
      },
      where: {
        weekId: req.body.week
      }
    })
      .then(comment => res.status(200).send(comment))
      .catch(error => {
        res.status(400).send(error)
        logger.error(error)
      })
  }
}
