const escape = require('escape-html')
const nodemailer = require('nodemailer')
const { Comment, Week, StudentInstance, TeacherInstance, User, CourseInstance } = require('../models')
const logger = require('../utils/logger')
const { hiddenFromStudents } = require('../helpers/finalReview')
const { requireCourseStaff } = require('../helpers/auth')
const { badRequest, forbidden, notFound } = require('../utils/httpError')

const env = process.env.NODE_ENV || 'development'
// Base of the links in the emails; the frontend routes are under /labtool.
const DEFAULT_FRONTEND_URL = env === 'production' || env === 'staging'
  ? 'https://study.cs.helsinki.fi/labtool'
  : 'http://localhost:3000/labtool'
const frontendUrl = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, '')

// SMTP_HOST / SMTP_PORT point the backend at another mail server, e.g. the Mailpit container in the
// dev and e2e docker compose stacks. When SMTP_HOST is set, email is really sent in every environment;
// otherwise it is only sent in production and staging and simulated elsewhere.
const SENDER_SETTINGS = {
  from: 'Labtool Robot <noreply@helsinki.fi>',
  host: process.env.SMTP_HOST || 'smtp.helsinki.fi',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false
}
// points are stored as floating point numbers; show at most two decimals, e.g. 3, 0.5, 1.25 (#508)
const roundPoints = points => String(Number(Number(points).toFixed(2)) + 0)

const SEND_REAL_EMAIL = env === 'production' || env === 'staging' || !!process.env.SMTP_HOST

// Helper function for send: the recipient and content of a notification about a comment.
// Returned fields differ based on role argument.
const commentMessage = async (role, commentId) => {
  if (role === 'teacher') {
    const comment = await Comment.findOne({
      attributes: ['weekId', 'comment', 'hidden'],
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
    if (!comment) {
      throw notFound('Comment not found.')
    }

    const { StudentInstance: student } = comment.Week
    return {
      address: student.User.email,
      content: {
        course: {
          name: student.CourseInstance.name,
          ohid: student.CourseInstance.ohid
        },
        text: comment.comment
      },
      hidden: comment.hidden,
      weekId: comment.weekId,
      courseId: student.CourseInstance.id
    }
  }
  if (role === 'student') {
    const comment = await Comment.findOne({
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
    if (!comment) {
      throw notFound('Comment not found.')
    }

    const { StudentInstance: student } = comment.Week
    return {
      // null when the student has no instructor assigned
      instructor: student.TeacherInstance,
      address: student.TeacherInstance ? student.TeacherInstance.User.email : null,
      content: {
        course: {
          name: student.CourseInstance.name,
          ohid: student.CourseInstance.ohid
        },
        text: comment.comment
      },
      studentId: comment.Week.studentInstanceId,
      userId: student.userId
    }
  }
  throw badRequest('Bad value for "role".')
}

// Helper function for send: the recipient and content of a notification about a week review.
const weekMessage = async (role, weekId) => {
  if (role !== 'teacher') {
    throw badRequest('Bad value for "role".')
  }
  const week = await Week.findOne({
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
  if (!week) {
    throw notFound('Week not found.')
  }

  const { StudentInstance: student } = week
  return {
    address: student.User.email,
    content: {
      course: {
        name: student.CourseInstance.name,
        ohid: student.CourseInstance.ohid
      },
      text: week.feedback,
      points: week.points
    },
    weekId,
    courseId: student.CourseInstance.id
  }
}

const markAsNotified = async (useComment, id) => {
  const Model = useComment ? Comment : Week
  await Model.update({ notified: true }, { where: { id } })
}

const recipientsOf = options => [].concat(options.to || [], options.cc || [], options.bcc || [])

/**
 * Sends an email, or only logs it when real sending is off.
 * Returns the addresses the mail server accepted and the ones it rejected. nodemailer resolves when
 * at least one recipient is accepted and throws EENVELOPE when the server rejects all of them;
 * both are reported here the same way. Other errors (e.g. no connection) are thrown.
 */
const trySendEmail = async (emailOptions) => {
  const options = {
    from: SENDER_SETTINGS.from,
    ...emailOptions
  }

  if (!SEND_REAL_EMAIL) {
    logger.info('Simulated sending email.', { subject: options.subject, to: options.to, bcc: options.bcc })
    return { simulated: true, accepted: recipientsOf(options), rejected: [] }
  }

  const transporter = nodemailer.createTransport(SENDER_SETTINGS)
  try {
    const mail = await transporter.sendMail(options)
    return { simulated: false, accepted: mail.accepted, rejected: mail.rejected }
  } catch (error) {
    if (error.code === 'EENVELOPE' && Array.isArray(error.rejected)) {
      return { simulated: false, accepted: [], rejected: error.rejected }
    }
    throw error
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
  const { role } = req.body
  if (!(role === 'teacher' || role === 'student')) {
    throw badRequest('Missing field "role".')
  }
  if (typeof req.body.weekId !== 'number' && typeof req.body.commentId !== 'number') {
    throw badRequest('Missing required field "weekId" or "commentId".')
  }

  // If commentId has been supplied, use it. Otherwise use weekId.
  const useComment = req.body.commentId !== undefined

  if (!useComment && role === 'student') {
    throw badRequest('Must send a notification about a comment as a student')
  }

  const message = useComment
    ? await commentMessage(role, req.body.commentId)
    : await weekMessage(role, req.body.weekId)

  if (role === 'teacher') {
    // Since a comment cannot be tracked down to its author, we just check that the request maker is course staff.
    await requireCourseStaff(req, message.courseId)
    if (message.hidden) {
      throw badRequest('The comment is hidden from the student, so the student cannot be notified about it.')
    }
    // an email would reveal a final review that students cannot see yet
    const week = await Week.findByPk(message.weekId, { attributes: ['weekNumber'] })
    const course = await CourseInstance.findByPk(message.courseId, {
      attributes: ['finalReview', 'weekAmount', 'finalReviewVisible']
    })
    if (week && hiddenFromStudents(course, week.weekNumber)) {
      throw badRequest('The final review is hidden from students; show it in the course settings before notifying the student.')
    }
  } else {
    if (message.userId !== req.decoded.id) {
      throw forbidden('You cannot send an email notification about someone else\'s comment.')
    }
    if (!message.instructor) {
      throw badRequest('Cannot send email to instructor because there is no instructor assigned to you.')
    }
  }

  if (!message.address) {
    throw badRequest('The recipient has no email address; the notification was not sent.')
  }

  const { course, text, points } = message.content
  const subject = `${course.name} new message`
  let html
  if (useComment) {
    const link = role === 'teacher'
      ? `${frontendUrl}/courses/${course.ohid}`
      : `${frontendUrl}/browsereviews/${course.ohid}/${message.studentId}`
    html = buildEmail(null, link, course.name, null, 'Message content', text)
  } else {
    const link = `${frontendUrl}/courses/${course.ohid}`
    html = buildEmail('Your submission has been reviewed', link, course.name, points, 'Feedback', text)
  }

  const { simulated, rejected } = await trySendEmail({
    subject,
    html,
    to: message.address
  })

  if (rejected.length > 0) {
    throw badRequest(`The mail server rejected the address ${message.address}; the notification was not sent.`)
  }
  await markAsNotified(useComment, useComment ? req.body.commentId : req.body.weekId)
  res.status(200).send({
    message: simulated ? 'Email sending simulated.' : 'Email sent successfully.',
    data: req.body
  })
}

/**
 * Send a mass email notification to any number of students.
 *   permissions: must be teacher/instructor on the course on which the students are
 *
 * @param {*} req
 * @param {*} res
 */
const sendMass = async (req, res) => {
  if (!Array.isArray(req.body.students)) {
    throw badRequest('Missing field "students".')
  }
  if (!(req.body.content) || req.body.content.length > 4096) {
    throw badRequest('Missing field "content".')
  }

  const courseInstance = await CourseInstance.findOne({
    where: {
      ohid: req.params.id
    }
  })
  if (!courseInstance) {
    throw notFound('Course instance not found.')
  }

  await requireCourseStaff(req, courseInstance.id, 'You have to be a teacher of the course to send mass emails.')

  const students = (await Promise.all(req.body.students.map(async ({ id }) => {
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

    const user = await User.findByPk(studentInstance.userId)
    return { user, studentInstanceId: id }
  }))).filter(student => student)
  const fullName = user => `${user.firsts} ${user.lastname}`
  const studentRecipients = students
    .filter(({ user }) => user.email)
    .map(({ user, studentInstanceId }) => ({ name: fullName(user), email: user.email, studentInstanceId }))
  const studentsWithoutEmail = students
    .filter(({ user }) => !user.email)
    .map(({ user, studentInstanceId }) => ({ name: fullName(user), email: null, studentInstanceId }))

  if (studentRecipients.length === 0) {
    throw notFound('No student email addresses found.')
  }

  let instructorRecipients = []
  if (req.body.sendToInstructors) {
    const teachers = await TeacherInstance.findAll({
      attributes: ['userId'],
      where: {
        courseInstanceId: courseInstance.id
      }
    })
    instructorRecipients = (await Promise.all(teachers.map(async ({ userId }) => {
      const user = await User.findByPk(userId)
      if (!user || !user.email) {
        return null
      }

      return { name: fullName(user), email: user.email, studentInstanceId: null }
    }))).filter(recipient => recipient)
  }

  const link = `${frontendUrl}/courses/${req.params.id}`
  const subject = `${courseInstance.name} new message from instructor`
  const html = buildEmail(null, link, courseInstance.name, null, 'Message content', req.body.content)
  const recipients = studentRecipients.concat(instructorRecipients)
  const { simulated, accepted, rejected } = await trySendEmail({
    subject,
    html,
    bcc: recipients.map(recipient => recipient.email)
  })

  // Tell the teacher exactly who did not get the email (#1141).
  const rejectedAddresses = rejected.map(address => address.toLowerCase())
  const notDelivered = [
    ...recipients
      .filter(recipient => rejectedAddresses.includes(recipient.email.toLowerCase()))
      .map(recipient => ({ ...recipient, reason: 'rejected by the mail server' })),
    ...studentsWithoutEmail.map(student => ({ ...student, reason: 'no email address' }))
  ]
  const notDeliveredText = notDelivered
    .map(({ name, email, reason }) => (email ? `${name} (${email}, ${reason})` : `${name} (${reason})`))
    .join('; ')

  if (accepted.length === 0) {
    // not an HttpError: the frontend lists notDelivered next to the message
    res.status(400).send({
      message: `No email was sent. Not delivered to: ${notDeliveredText}.`,
      notDelivered
    })
    return
  }
  let message = simulated ? 'Email sending simulated.' : 'Email sent successfully.'
  if (notDelivered.length > 0) {
    message = `Email sent to ${accepted.length} of ${accepted.length + notDelivered.length} recipients. Not delivered to: ${notDeliveredText}.`
  }
  res.status(200).send({ message, data: req.body, notDelivered })
}

const buildEmail = (title, link, courseName, pointsAwarded, contentTitle, content) => `
  ${title !== null ? `<h1>${title}</h1>` : ''}
  <p><a href="${link}">${link}</a></p>
  <p>course: ${courseName}</p>
  ${pointsAwarded !== null && pointsAwarded !== undefined ? `<p>points awarded: ${roundPoints(pointsAwarded)}</p>` : ''}
  <p><i>This is an automated message sent using the Labtool email tool. Please do not reply to this email.</i></p>
  <h2>${contentTitle}</h2>
  <p>${escape(content).replace(/\n/g, '<br>')}</p>
`

module.exports = {
  send,
  sendMass
}
