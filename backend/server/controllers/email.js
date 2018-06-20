const helper = require('../helpers/email_helper')
const nodemailer = require('nodemailer')
const { Comment, Week, StudentInstance, TeacherInstance, User } = require('../models')

const SENDER_SETTINGS = {
  from: 'Labtool Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false
}

module.exports = {
  async send(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      let receiver
      if (req.body.role === 'teacher') {
        const queryResult = await Comment.findOne({
          attributes: ['weekId'],
          where: {
            id: req.body.commentId
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
                  }
                ]
              }
            }
          ]
        })
        receiver = queryResult.dataValues.Week.StudentInstance.User.dataValues.email
      }
      const transporter = nodemailer.createTransport(SENDER_SETTINGS)
      const options = {
        from: SENDER_SETTINGS.from,
        to: receiver,
        subject: 'Labtool notification',
        text: 'Hello world'
      }
      const mail = await transporter.sendMail(options)
      res.status(200).send(mail)
    } catch (e) {
      console.log(e)
      res.status(500).send('Unexpected error')
    }
  }
}
