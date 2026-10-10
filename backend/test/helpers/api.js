const supertest = require('supertest')
const { app } = require('../../app')
const { tokenFor } = require('./factories')

const api = supertest(app)

const withToken = (token) => {
  const auth = req => (token ? req.set('Authorization', `Bearer ${token}`) : req)
  return {
    get: url => auth(api.get(url)),
    post: url => auth(api.post(url)),
    put: url => auth(api.put(url)),
    delete: url => auth(api.delete(url))
  }
}

/** Requests authenticated as the given user (a User model instance). */
const as = user => withToken(tokenFor(user))

/** Requests without any Authorization header. */
const anonymous = () => withToken(null)

module.exports = {
  app,
  api,
  as,
  anonymous,
  withToken
}
