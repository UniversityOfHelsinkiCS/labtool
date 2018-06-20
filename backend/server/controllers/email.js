const helper = require('../helpers/email_helper')
const nodemailer = require('nodemailer')
const { Comment, Week, StudentInstance, TeacherInstance, User, CourseInstance } = require('../models')
const env = process.env.NODE_ENV || 'development'
const frontendUrl = process.env.FRONTEND_URL || 'cs.helsinki.labtool.fi'

const SENDER_SETTINGS = {
  from: 'Labtool Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false
}

const commentMessage = async (role, commentId) => {
  try {
    if (role === 'teacher') {
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
                  attributes: ['name', 'ohid']
                }
              ]
            }
          }
        ]
      })
      return {
        success: true,
        address: queryResult.dataValues.Week.StudentInstance.User.dataValues.email,
        content: {
          course: {
            name: queryResult.dataValues.Week.StudentInstance.CourseInstance.dataValues.name,
            ohid: queryResult.dataValues.Week.StudentInstance.CourseInstance.dataValues.ohid
          },
          text: queryResult.dataValues.comment
        }
      }
    } else if (role === 'student') {
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
                attributes: ['teacherInstanceId', 'id'],
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
        return {
          success: true,
          address: student.TeacherInstance.User.dataValues.email,
          content: {
            course: {
              name: student.CourseInstance.dataValues.name,
              ohid: student.CourseInstance.dataValues.ohid
            },
            text: queryResult.dataValues.comment,
            studentId: student.dataValues.id
          }
        }
      } else {
        return {
          success: false
        }
      }
    }
  } catch (e) {
    return {
      success: false
    }
  }
}

const weekMessage = async (role, weekId) => {
  try {
    if (role === 'teacher') {
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
                attributes: ['name', 'ohid']
              }
            ]
          }
        ]
      })
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
        }
      }
    } else {
      return {
        success: false
      }
    }
  } catch (e) {
    return {
      success: false
    }
  }
}

module.exports = {
  async send(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      const useComment = req.body.commentId !== undefined
      const options = {
        from: SENDER_SETTINGS.from,
        subject: 'Labtool notification'
      }
      let message
      if (useComment) {
        message = await commentMessage(req.body.role, req.body.commentId)
        if (message.content) {
          const link =
            req.body.role === 'teacher' ? `${frontendUrl}/courses/${message.content.course.ohid}` : `${frontendUrl}/browsereviews/${message.content.course.ohid}/${message.content.studentId}`
          options.html = `
            <p>${link}</p>
            <p>${message.content.course.name}</p>
            <p>${message.content.text}</p>
          `
        }
      } else {
        message = await weekMessage(req.body.role, req.body.weekId)
        if (message.content) {
          const link = `${frontendUrl}/courses/${message.content.course.ohid}`
          options.html = `
            <p>${link}</p>
            <p>${message.content.course}</p>
            <p>${message.content.points}</p>
            <p>${message.content.text}</p>
          `
        }
      }
      console.log(message)
      if (!message.success) {
        res.status(400).send('Unable to find receiver address')
        return
      }
      options.to = message.address
      if (env !== 'production') {
        res.status(200).send({
          message: 'Email sending simulated',
          data: req.body,
          options
        })
        return
      }
      const transporter = nodemailer.createTransport(SENDER_SETTINGS)
      const mail = await transporter.sendMail(options)
      if (mail.rejected.length > 0) {
        res.status(403).send('Email rejected by SMTP server.')
        return
      }
      res.status(200).send({
        message: 'Email sent successfully',
        data: req.body
      })
    } catch (e) {
      console.log(e)
      res.status(500).send('Unexpected error')
    }
  }
}
