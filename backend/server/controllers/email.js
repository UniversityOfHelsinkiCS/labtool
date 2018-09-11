const helper = require('../helpers/email_helper')
const nodemailer = require('nodemailer')
const { Comment, Week, StudentInstance, TeacherInstance, User, CourseInstance } = require('../models')
const env = process.env.NODE_ENV || 'development'
const frontendUrl = process.env.FRONTEND_URL || 'cs.helsinki.labtool.fi'
const logger = require('../utils/logger')

const SENDER_SETTINGS = {
  from: 'Labtool Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false
}

// Helper function for send
// Returned fields differ based on role argument.
const commentMessage = async (role, commentId) => {
  try {
    if (role === 'teacher') {
      // Database query
      const queryResult = await Comment.findOne({
        attributes: ['weekId', 'comment'],
        where: {
          id: commentId
        },
        include: [
          {
            model: Week,
            attributes: ['studentInstanceId'],
            include: {
              model: StudentInstance,
              attributes: ['userId'],
              include: [
                {
                  model: User,
                  attributes: ['email']
                },
                {
                  model: CourseInstance,
                  attributes: ['name', 'ohid', 'id']
                }
              ]
            }
          }
        ]
      })

      // Parse queryResult into a more succinct form.
      return {
        success: true,
        address: queryResult.dataValues.Week.StudentInstance.User.dataValues.email,
        content: {
          course: {
            name: queryResult.dataValues.Week.StudentInstance.CourseInstance.dataValues.name,
            ohid: queryResult.dataValues.Week.StudentInstance.CourseInstance.dataValues.ohid
          },
          text: queryResult.dataValues.comment
        },
        courseId: queryResult.dataValues.Week.StudentInstance.CourseInstance.dataValues.id
      }
    } else if (role === 'student') {
      // Database query
      const queryResult = await Comment.findOne({
        attributes: ['weekId', 'comment'],
        where: {
          id: commentId
        },
        include: [
          {
            model: Week,
            attributes: ['studentInstanceId'],
            include: [
              {
                model: StudentInstance,
                attributes: ['teacherInstanceId', 'userId'],
                include: [
                  {
                    model: TeacherInstance,
                    attributes: ['userId'],
                    required: false,
                    include: [
                      {
                        model: User,
                        attributes: ['email']
                      }
                    ]
                  },
                  {
                    model: CourseInstance,
                    attributes: ['name', 'ohid']
                  }
                ]
              }
            ]
          }
        ]
      })
      const student = queryResult.dataValues.Week.StudentInstance
      if (student.TeacherInstance) {
        // If student has an instructor assigned.

        // Parse queryResult into a more succinct form.
        return {
          success: true,
          address: student.TeacherInstance.User.dataValues.email,
          content: {
            course: {
              name: student.CourseInstance.dataValues.name,
              ohid: student.CourseInstance.dataValues.ohid
            },
            text: queryResult.dataValues.comment
          },
          studentId: queryResult.dataValues.Week.dataValues.studentInstanceId,
          userId: student.dataValues.userId
        }
      } else {
        return {
          success: false,
          status: 404,
          error: 'Cannot send email to instructor because there is no instructor assigned to you.'
        }
      }
    } else {
      return {
        success: false,
        status: 400,
        error: 'Bad value for "role"'
      }
    }
  } catch (e) {
    logger.error(e)
    return {
      success: false,
      status: 500,
      error: 'Unexpected error'
    }
  }
}

// Helper function for send
const weekMessage = async (role, weekId) => {
  try {
    if (role === 'teacher') {
      // Database query
      const queryResult = await Week.findOne({
        attributes: ['studentInstanceId', 'feedback', 'points'],
        where: {
          id: weekId
        },
        include: [
          {
            model: StudentInstance,
            attributes: ['userId'],
            include: [
              {
                model: User,
                attributes: ['email']
              },
              {
                model: CourseInstance,
                attributes: ['name', 'ohid', 'id']
              }
            ]
          }
        ]
      })

      // Parse queryResult into a more succinct form.
      return {
        success: true,
        address: queryResult.dataValues.StudentInstance.User.dataValues.email,
        content: {
          course: {
            name: queryResult.dataValues.StudentInstance.CourseInstance.dataValues.name,
            ohid: queryResult.dataValues.StudentInstance.CourseInstance.dataValues.ohid
          },
          text: queryResult.dataValues.feedback,
          points: queryResult.dataValues.points
        },
        courseId: queryResult.dataValues.StudentInstance.CourseInstance.dataValues.id
      }
    } else {
      return {
        success: false,
        status: 400,
        error: 'Bad value for "role"'
      }
    }
  } catch (e) {
    logger.error(e)
    return {
      success: false,
      status: 500,
      error: 'Unexpected error'
    }
  }
}

const markAsNotified = (useComment, id) => {
  // Mark the comment/week as notified asynchronously in the background.
  if (useComment) {
    Comment.update(
      {
        notified: true
      },
      {
        where: {
          id
        }
      }
    )
  } else {
    Week.update(
      {
        notified: true
      },
      {
        where: {
          id
        }
      }
    )
  }
}

module.exports = {
  async send(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      // Basic validations
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (!(req.body.role === 'teacher' || req.body.role === 'student')) {
        res.status(400).send('Missing field "role".')
        return
      }
      if (typeof req.body.weekId !== 'number' && typeof req.body.commentId !== 'number') {
        res.status(400).send('Missing required field "weekId" or "commentId".')
        return
      }

      // If commentId has been supplied, use it. Otherwise use weekId.
      const useComment = req.body.commentId !== undefined

      // Initialize options with just from, build the rest as we go.
      const options = {
        from: SENDER_SETTINGS.from
      }

      // message is an object supplied by a helper function.
      let message
      if (useComment) {
        message = await commentMessage(req.body.role, req.body.commentId)
        if (message.content) {
          options.subject = `${message.content.course.name} new message` // Email tile

          // Email body defined as options.html
          const link = req.body.role === 'teacher' ? `${frontendUrl}/courses/${message.content.course.ohid}` : `${frontendUrl}/browsereviews/${message.content.course.ohid}/${message.studentId}`
          options.html = `
            <h1>You've received a message in Labtool.</h1>
            <p><a href="${link}">${link}</a></p>
            <p>course: ${message.content.course.name}</p>
            <h2>Message content</h2>
            <p>${message.content.text}</p>
          `
        }
      } else {
        // commentId was not supplied, so use weekId instead.
        message = await weekMessage(req.body.role, req.body.weekId)
        if (message.content) {
          options.subject = `${message.content.course.name} new message` // Email title

          // Email body defined as options.html
          const link = `${frontendUrl}/courses/${message.content.course.ohid}`
          options.html = `
            <h1>Your submission has been reviewed</h1>
            <p><a href="${link}">${link}</a></p>
            <p>course: ${message.content.course.name}</p>
            <p>points awarded: ${message.content.points}</p>
            <h2>Feedback</h2>
            <p>${message.content.text}</p>
          `
        }
      }

      // If the helper function failed, report it here
      if (!message.success) {
        res.status(message.status).send(message.error)
        return
      }

      if (req.body.role === 'teacher') {
        // Teacher validation
        // Since a comment cannot be tracked down to its author, we just check that the request amker is a teacher.
        const teacherInstance = await TeacherInstance.findOne({
          attributes: ['id'],
          where: {
            userId: req.decoded.id,
            courseInstanceId: message.courseId
          }
        })
        if (!teacherInstance) {
          res.status(403).send('You must be a teacher of the course to perform this action.')
          return
        }
      } else {
        // Student validation
        if (message.userId !== req.decoded.id) {
          res.status(403).send("You cannot send an email notification about someone else's comment.")
          return
        }
      }

      options.to = message.address // Email recipient

      if (env !== 'production') {
        // Cannot send emails from localhost. The smtp server would reject requests.
        markAsNotified(useComment, req.body.commentId || req.body.weekId)

        res.status(200).send({
          message: 'Email sending simulated',
          data: req.body,
          options
        })
        return
      }

      // In production, send email
      const transporter = nodemailer.createTransport(SENDER_SETTINGS)
      const mail = await transporter.sendMail(options)

      // mail.rejected is an array that holds all rejected emails.
      if (mail.rejected.length > 0) {
        res.status(403).send('Email rejected by SMTP server.')
        return
      }

      markAsNotified(useComment, req.body.commentId || req.body.weekId)

      res.status(200).send({
        message: 'Email sent successfully',
        data: req.body
      })
    } catch (e) {
      logger.error(e)
      res.status(500).send('Unexpected error')
    }
  }
}
