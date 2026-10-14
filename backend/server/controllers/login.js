const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { badRequest } = require('../utils/httpError')

/**
 * Login with the Shibboleth headers.
 *   permissions: anyone
 *
 * @param req
 * @param res
 */
const login = async (req, res) => {
  const [user, created] = await User.findOrCreate({
    where: { username: req.headers.uid },
    defaults: {
      firsts: req.headers.givenname,
      lastname: req.headers.sn,
      studentNumber: req.headers.hypersonstudentid ? req.headers.hypersonstudentid : null,
      email: req.headers.mail
    }
  })
  const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
  res.status(200).send({
    user,
    token,
    created
  })
}

/**
 * Fake login, only works if fake login is enabled
 *   permissions: anyone
 *
 * @param {*} req
 * @param {*} res
 */
const loginFake = async (req, res) => {
  if (!req.headers.uid || !req.headers.givenname) {
    throw badRequest('no info, no login')
  }
  await login(req, res)
}

module.exports = {
  login,
  loginFake
}
