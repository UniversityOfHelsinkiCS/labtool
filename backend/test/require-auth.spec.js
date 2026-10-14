const assert = require('assert')
const { api, withToken } = require('./helpers/api')

/*
 * Authentication is enforced once, by requireAuth in app.js, instead of a check in every handler.
 */
describe('requireAuth', () => {
  const protectedRoutes = [
    ['get', '/api/users'],
    ['get', '/api/courseinstances'],
    ['post', '/api/courseinstances/coursepage'],
    ['put', '/api/codereviews/grade'],
    ['post', '/api/tags/create/'],
    ['get', '/api/changelog/1'],
    ['post', '/api/email/send'],
    ['get', '/api/no-such-route']
  ]

  protectedRoutes.forEach(([method, path]) => {
    it(`answers 401 { message } to ${method.toUpperCase()} ${path} without a token`, async () => {
      const res = await api[method](path).send({})
      assert.strictEqual(res.status, 401)
      assert.deepStrictEqual(res.body, { message: 'you have to be authenticated' })
    })
  })

  it('answers 401 to an invalid token', async () => {
    await withToken('not-a-jwt').get('/api/users').expect(401)
  })

  it('keeps the public paths public', async () => {
    await api.get('/api').expect(200)
    await api.get('/api/ping').expect(200)
    await api.post('/api/logout').send({ returnUrl: 'http://localhost' }).expect(200)
  })

  it('lets CORS preflights through', async () => {
    const res = await api.options('/api/users')
    assert.notStrictEqual(res.status, 401)
  })
})
