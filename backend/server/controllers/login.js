const jwt = require('jsonwebtoken')
const User = require('../models').User
const logger = require('../utils/logger')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  login(req, res) {
    try {
      User.findOrCreate({
        where: { username: req.headers.uid },
        defaults: {
          firsts: Buffer.from(req.headers.givenname, 'binary').toString('utf8'),
          lastname: Buffer.from(req.headers.sn, 'binary').toString('utf8'),
          studentNumber: req.headers.schacpersonaluniquecode ? req.headers.schacpersonaluniquecode.split(':')[6] : null,
          email: req.headers.mail
        }
      }).spread((user, created) => {
        const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
        res.status(200).send({
          user,
          token,
          created
        })
      })
    } catch (error) {
      logger.error('login error', { error: error.message })
      res.status(500).send({
        error: 'Unexpected error'
      })
    }
  }
}
