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
const login = async (req, res) => {
  console.log('login func called')


  try {
    const [user, created] = await User.findOrCreate({
      where: { username: req.headers.uid },
      defaults: {
        firsts: req.headers.givenname,
        lastname: req.headers.sn,
        studentNumber: req.headers.hypersonstudentid ? req.headers.hypersonstudentid : null,
        email: req.headers.mail
      }
    })
    console.log(user)
    console.log('signing jwt')
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
    console.log('sending jwt')
    res.status(200).send({
      user,
      token,
      created
    })
  } catch (error) {
    console.log('BOOOM from login')
    console.log(error)
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
const loginFake = async (req, res) => {
  console.log('login fake called')

  if (!req.headers.uid || !req.headers.givenname) {
    res.status(500).send({
      error: 'no info, no login'
    })
    return
  }
  console.log('server saw the login req')
  const result = await login(req, res)
  return result
}

module.exports = {
  login,
  loginFake
}
