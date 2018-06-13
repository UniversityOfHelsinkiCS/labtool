const Tag = require('../models').Tag
const TeacherInstance = require('../models').TeacherInstance
const helper = require('../helpers/course_instance_helper')

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
          userID: req.decoded.id
        }
      }).then(teacher => {
        if (!teacher) {
          res.status(400).send('You need to be a teacher to do this.')
        }
        Tag.findOrCreate({
          where: {
            name: req.body.text
          }
        }).then(tag => {
          tag.updateAttributes({
            color: req.body.color
          })

          if (req.body.newText) {
            tag.updateAttributes({
              text: req.body.newText
            })
          }

          res.status(200).send(tag)
        })
      })
    } catch (e) {
      res.status(400).send(e)
    }
  },

  async getAll(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      const tags = await Tag.findAll()
      res.status(200).send(tags)
    } catch (e) {
      res.status(400).send('Unable to send all tags')
    }
  }
}
