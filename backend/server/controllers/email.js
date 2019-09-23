const escape = require('escape-html')
const nodemailer = require('nodemailer')
const helper = require('../helpers/emailHelper')
const { Comment, Week, StudentInstance, TeacherInstance, User, CourseInstance } = require('../models')
const logger = require('../utils/logger')

const env = process.env.NODE_ENV || 'development'
const frontendUrl = process.env.FRONTEND_URL || 'cs.helsinki.labtool.fi'

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
    } if (role === 'student') {
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
      }
      return {
        success: false,
        status: 404,
        error: 'Cannot send email to instructor because there is no instructor assigned to you.'
      }
    }
    return {
      success: false,
      status: 400,
      error: 'Bad value for "role"'
    }
  } catch (e) {
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
    }
    return {
      success: false,
      status: 400,
      error: 'Bad value for "role"'
    }
  } catch (e) {
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

const reject = async (res, code, message) => {
  res.status(code).send({
    message
  })
}

const trySendEmail = async (emailOptions) => {
  const options = {
    from: SENDER_SETTINGS.from,
    ...emailOptions
  }

  if (env !== 'production') {
    console.log('simulated email sending', options)
    return {
      success: true,
      simulated: true
    }
  }

  // In production, send email
  const transporter = nodemailer.createTransport(SENDER_SETTINGS)
  const mail = await transporter.sendMail(options)

  return {
    success: mail.rejected.length === 0,
    simulated: false
  }
}

const send = async (req, res) => {
  if (!helper.controllerBeforeAuthCheckAction(req, res)) {
    return
  }

  try {
    // Basic validations
    if (!req.authenticated.success) {
      return reject(res, 403, 'you have to be authenticated to do this')
    }
    if (!(req.body.role === 'teacher' || req.body.role === 'student')) {
      return reject(res, 400, 'Missing field "role".')
    }
    if (typeof req.body.weekId !== 'number' && typeof req.body.commentId !== 'number') {
      return reject(res, 400, 'Missing required field "weekId" or "commentId".')
    }

    // If commentId has been supplied, use it. Otherwise use weekId.
    const useComment = req.body.commentId !== undefined

    let subject
    let html

    // message is an object supplied by a helper function.
    let message
    if (useComment) {
      message = await commentMessage(req.body.role, req.body.commentId)
      if (message.content) {
        subject = `${message.content.course.name} new message` // Email tile

        // Email body defined as html
        const link = req.body.role === 'teacher'
          ? `${frontendUrl}/courses/${message.content.course.ohid}`
          : `${frontendUrl}/browsereviews/${message.content.course.ohid}/${message.studentId}`
        html = `
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
        subject = `${message.content.course.name} new message` // Email title

        // Email body defined as html
        const link = `${frontendUrl}/courses/${message.content.course.ohid}`
        html = `
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
        return reject(res, 403, 'You must be a teacher of the course to perform this action.')
      }
    } else if (req.body.role === 'student') {
      // Student validation
      if (message.userId !== req.decoded.id) {
        return reject(res, 403, 'You cannot send an email notification about someone else\'s comment.')
      }
    }

    const { success, simulated } = await trySendEmail({
      subject,
      html,
      to: message.address
    })

    if (success) {
      markAsNotified(useComment, req.body.commentId || req.body.weekId)
      res.status(200).send({
        message: simulated ? 'Email sending simulated' : 'Email sent successfully',
        data: req.body
      })
    } else {
      return reject(res, 400, 'Email rejected by SMTP server.')
    }
  } catch (e) {
    logger.error(e)
    return reject(res, 500, 'Unexpected error')
  }
}

const sendMass = async (req, res) => {
  if (!helper.controllerBeforeAuthCheckAction(req, res)) {
    return
  }

  try {
    // Basic validations
    if (!req.authenticated.success) {
      return reject(res, 403, 'you have to be authenticated to do this')
    }
    if (!(req.body.students)) {
      return reject(res, 400, 'Missing field "students".')
    }
    if (!(req.body.content) || req.body.content.length > 4096) {
      return reject(res, 400, 'Missing field "content".')
    }

    const courseInstance = await CourseInstance.findOne({
      where: {
        ohid: req.params.id
      }
    })
    if (!courseInstance) {
      return reject(res, 404, 'course instance not found')
    }

    const teacher = await TeacherInstance.findOne({
      attributes: ['id'],
      where: {
        userId: req.decoded.id,
        courseInstanceId: courseInstance.id
      }
    })
    if (!teacher || !req.authenticated.success) {
      return reject(res, 403, 'You have to be a teacher of the course to send mass emails')
    }

    const inputStudents = req.body.students
    const studentEmails = (await Promise.all(inputStudents.map(async ({ id }) => {
      const studentInstance = await StudentInstance.findOne({
        attributes: ['userId'],
        where: {
          id,
          courseInstanceId: courseInstance.id
        }
      })
      if (!studentInstance) {
        return null
      }

      // ok, get user
      const user = await User.findOne({
        where: {
          id: studentInstance.userId
        }
      })
      if (!user) {
        return null
      }

      return user.email || ''
    }))).filter(email => email)

    if (studentEmails.length === 0) {
      return reject(res, 404, 'No student email addresses found')
    }

    // prepare email here
    const link = `${frontendUrl}/courses/${req.params.id}`
    const subject = `${courseInstance.name} new message from instructor`
    const html = `
      <h1>You've received a message in Labtool.</h1>
      <p><a href="${link}">${link}</a></p>
      <p>course: ${courseInstance.name}</p>
      <h2>Message content</h2>
      <p>${escape(req.body.content)}</p>
    `

    const { success, simulated } = await trySendEmail({
      subject,
      html,
      bcc: studentEmails
    })

    if (success) {
      res.status(200).send({
        message: simulated ? 'Email sending simulated' : 'Email sent successfully',
        data: req.body
      })
    } else {
      return reject(res, 400, 'Email rejected by SMTP server.')
    }
  } catch (e) {
    logger.error(e)
    return reject(res, 500, 'Unexpected error')
  }
}

module.exports = {
  send,
  sendMass
}
