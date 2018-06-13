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
          userId: req.decoded.id
        }
      }).then(teacher => {
        if (!teacher) {
          res.status(400).send('You need to be a teacher to do this.')
          return
        }
        console.log('\n\nreq.body: ', req.body, '\n\n')
        Tag.findOrCreate({
          where: {
            name: req.body.text
          }
        }).then(tag => {
          Tag.update({ color: req.body.color }, { where: { id: tag[0].id } })
            .then(tag => {
              if (req.body.newText) {
                Tag.update({ text: req.body.newText }, { where: { id: tag[0].id } })
              }
              res.status(200).send(tag)
              return
            })
            .catch(error => {
              res.status(400).send('new text did not update')
              return
            })
        })
      })
    } catch (e) {
      res.status(400).send(e)
    }
  },

  getAll(req, res) {
    helper.controller_before_auth_check_action(req, res)

    try {
      return Tag.findAll()
        .then(tag => res.status(200).send(tag))
        .catch(error => res.status(400).send('et ny saa niitä tageja'))
    } catch (e) {
      res.status(400).send('nymmeni jokin pieleen')
      return
    }
  }
}
