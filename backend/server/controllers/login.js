const jwt = require('jsonwebtoken')
const { User } = require('../models')
const logger = require('../utils/logger')

/**
 * Login
 *   permissions: anyone
 *
 * @param req
 * @param res
 */
const login = (req, res) => {
  try {
    User.findOrCreate({
      where: { username: req.headers.uid },
      defaults: {
        firsts: req.headers.givenname,
        lastname: req.headers.sn,
        studentNumber: req.headers.hypersonstudentid ? req.headers.hypersonstudentid : null,
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
      error: 'Unexpected error. Please try again.'
    })
  }
}

/**
 * Fake login, only works if fake login is enabled
 *   permissions: anyone
 *
 * @param {*} req
 * @param {*} res
 */
const loginFake = (req, res) => {
  if (!req.headers.uid || !req.headers.givenname) {
    res.status(500).send({
      error: 'no info, no login'
    })
    return
  }
  return login(req, res)
}

module.exports = {
  login,
  loginFake
}
