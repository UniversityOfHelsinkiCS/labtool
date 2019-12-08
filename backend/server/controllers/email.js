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
        status: 400,
        error: 'Cannot send email to instructor because there is no instructor assigned to you.'
      }
    }
    return {
      success: false,
      status: 400,
      error: 'Bad value for "role".'
    }
  } catch (e) {
    return {
      success: false,
      status: 500,
      error: 'Unexpected error. Please try again.'
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
      error: 'Bad value for "role".'
    }
  } catch (e) {
    return {
      success: false,
      status: 500,
      error: 'Unexpected error. Please try again.'
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
    console.log('Simulated sending email.', options)
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

/**
 * Send email notification about a review or comment.
 *   permissions:
 *     if role == 'teacher': must be teacher/instructor on course
 *     if role == 'student': must be student on course, and must
 *       have sent the comment that we must notify about
 *       students also can only send notifications about comments
 *
 * @param {*} req
 * @param {*} res
 */
const send = async (req, res) => {
  if (!helper.controllerBeforeAuthCheckAction(req, res)) {
    return
  }

  try {
    // Basic validations
    if (!req.authenticated.success) {
      return reject(res, 403, 'You have to be authenticated to do this.')
    }
    if (!(req.body.role === 'teacher' || req.body.role === 'student')) {
      return reject(res, 400, 'Missing field "role".')
    }
    if (typeof req.body.weekId !== 'number' && typeof req.body.commentId !== 'number') {
      return reject(res, 400, 'Missing required field "weekId" or "commentId".')
    }

    // If commentId has been supplied, use it. Otherwise use weekId.
    const useComment = req.body.commentId !== undefined

    if (!useComment && req.body.role === 'student') {
      return reject(res, 400, 'Must send a notification about a comment as a student')
    }

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
        html = buildEmail(null, link, message.content.course.name, null, 'Message content', message.content.text)
      }
    } else {
      // commentId was not supplied, so use weekId instead.
      message = await weekMessage(req.body.role, req.body.weekId)
      if (message.content) {
        subject = `${message.content.course.name} new message` // Email title

        // Email body defined as html
        const link = `${frontendUrl}/courses/${message.content.course.ohid}`
        html = buildEmail('Your submission has been reviewed', link, message.content.course.name, message.content.points, 'Feedback', message.content.text)
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
        message: simulated ? 'Email sending simulated.' : 'Email sent successfully.',
        data: req.body
      })
    } else {
      return reject(res, 400, 'Email rejected by SMTP server.')
    }
  } catch (e) {
    logger.error(e)
    return reject(res, 500, 'Unexpected error. Please try again.')
  }
}

/**
 * Send a mass email notification to any number of students.
 *   permissions: must be teacher/instructor on the course on which the students are
 *
 * @param {*} req
 * @param {*} res
 */
const sendMass = async (req, res) => {
  if (!helper.controllerBeforeAuthCheckAction(req, res)) {
    return
  }

  try {
    // Basic validations
    if (!req.authenticated.success) {
      return reject(res, 403, 'You have to be authenticated to do this.')
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
      return reject(res, 404, 'Course instance not found.')
    }

    const teacher = await TeacherInstance.findOne({
      attributes: ['id'],
      where: {
        userId: req.decoded.id,
        courseInstanceId: courseInstance.id
      }
    })
    if (!teacher || !req.authenticated.success) {
      return reject(res, 403, 'You have to be a teacher of the course to send mass emails.')
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
      return reject(res, 404, 'No student email addresses found.')
    }

    let instructorEmails = []
    if (req.body.sendToInstructors) {
      const teachers = await TeacherInstance.findAll({
        attributes: ['userId'],
        where: {
          courseInstanceId: courseInstance.id
        }
      })
      instructorEmails = (await Promise.all(teachers.map(async ({ userId }) => {
        const user = await User.findOne({
          where: {
            id: userId
          }
        })
        if (!user) {
          return null
        }

        return user.email || ''
      }))).filter(email => email)
    }

    // prepare email here
    const link = `${frontendUrl}/courses/${req.params.id}`
    const subject = `${courseInstance.name} new message from instructor`
    const html = buildEmail(null, link, courseInstance.name, null, 'Message content', req.body.content)
    const { success, simulated } = await trySendEmail({
      subject,
      html,
      bcc: studentEmails.concat(instructorEmails)
    })

    if (success) {
      res.status(200).send({
        message: simulated ? 'Email sending simulated.' : 'Email sent successfully.',
        data: req.body
      })
    } else {
      return reject(res, 400, 'Email rejected by SMTP server.')
    }
  } catch (e) {
    logger.error(e)
    return reject(res, 500, 'Unexpected error. Please try again.')
  }
}

const buildEmail = (title, link, courseName, pointsAwarded, contentTitle, content) => `
  ${title !== null ? `<h1>${title}</h1>}` : null}
  <p><a href="${link}">${link}</a></p>
  <p>course: ${courseName}</p>
  ${pointsAwarded !== null ? `<p>points awarded: ${pointsAwarded}</p>` : ''}
  <p><i>This is an automated message sent using the Labtool email tool. Please do not reply to this email.</i></p>
  <h2>${contentTitle}</h2>
  <p>${escape(content).replace(/\n/g, '<br>')}</p>
`

module.exports = {
  send,
  sendMass
}
