const assert = require('assert')
const jwt = require('jsonwebtoken')
const { api, as, withToken } = require('./helpers/api')
const { createUser } = require('./helpers/factories')
const { User } = require('../server/models')

const shibbolethHeaders = {
  uid: 'kalle',
  givenname: 'Kalle',
  sn: 'Kayttaja',
  mail: 'kalle@example.com',
  hypersonstudentid: '014000001'
}

// Shibboleth passes UTF-8 header values that node reads as latin1; the app re-decodes them.
const asShibbolethHeaderValue = value => Buffer.from(value, 'utf8').toString('latin1')

describe('Login, logout and general API behavior', () => {
  describe('POST /api/login', () => {
    it('creates a new user from Shibboleth headers and returns a valid JWT', async () => {
      const res = await api
        .post('/api/login')
        .set(shibbolethHeaders)
        .expect(200)

      assert.strictEqual(res.body.created, true)
      assert.strictEqual(res.body.user.username, 'kalle')
      assert.strictEqual(res.body.user.firsts, 'Kalle')
      assert.strictEqual(res.body.user.lastname, 'Kayttaja')
      assert.strictEqual(res.body.user.email, 'kalle@example.com')
      assert.strictEqual(res.body.user.studentNumber, '014000001')

      const decoded = jwt.verify(res.body.token, process.env.SECRET)
      assert.strictEqual(decoded.username, 'kalle')
      assert.strictEqual(decoded.id, res.body.user.id)

      const users = await User.findAll()
      assert.strictEqual(users.length, 1)
      assert.strictEqual(users[0].id, res.body.user.id)
      assert.strictEqual(users[0].studentNumber, '014000001')
      assert.strictEqual(users[0].sysop, false)
    })

    it('logs in an existing user without creating a duplicate or overwriting stored data', async () => {
      const existing = await createUser({ username: 'kalle', email: 'kept@example.com' })

      const res = await api
        .post('/api/login')
        .set(shibbolethHeaders)
        .expect(200)

      assert.strictEqual(res.body.created, false)
      assert.strictEqual(res.body.user.id, existing.id)
      assert.strictEqual(res.body.user.email, 'kept@example.com')
      assert.strictEqual(await User.count(), 1)
      assert.strictEqual(jwt.verify(res.body.token, process.env.SECRET).id, existing.id)
    })

    it('stores a null student number when the hypersonstudentid header is missing', async () => {
      const headers = { ...shibbolethHeaders }
      delete headers.hypersonstudentid
      const res = await api
        .post('/api/login')
        .set(headers)
        .expect(200)

      assert.strictEqual(res.body.user.studentNumber, null)
      const user = await User.findOne({ where: { username: 'kalle' } })
      assert.strictEqual(user.studentNumber, null)
    })

    it('decodes UTF-8 Shibboleth header values correctly', async () => {
      const res = await api
        .post('/api/login')
        .set({
          ...shibbolethHeaders,
          givenname: asShibbolethHeaderValue('Äijä'),
          sn: asShibbolethHeaderValue('Öhkönen')
        })
        .expect(200)

      assert.strictEqual(res.body.user.firsts, 'Äijä')
      assert.strictEqual(res.body.user.lastname, 'Öhkönen')
      const user = await User.findByPk(res.body.user.id)
      assert.strictEqual(user.firsts, 'Äijä')
    })

    it('returns a token that authenticates later requests', async () => {
      const login = await api
        .post('/api/login')
        .set(shibbolethHeaders)
        .expect(200)

      const res = await withToken(login.body.token)
        .put('/api/users/update')
        .send({ email: 'new@example.com' })
        .expect(201)
      assert.strictEqual(res.body.username, 'kalle')
    })

    it('fails without Shibboleth headers and creates no user', async () => {
      await api.post('/api/login').expect(500)
      assert.strictEqual(await User.count(), 0)
    })

    it('does not expose the fake login endpoint unless fake login is enabled', async () => {
      await api
        .post('/api/loginFake')
        .set(shibbolethHeaders)
        .expect(404)
      assert.strictEqual(await User.count(), 0)
    })
  })

  describe('POST /api/logout', () => {
    it('returns the return url when there is no Shibboleth logout url', async () => {
      const res = await api
        .post('/api/logout')
        .send({ returnUrl: 'https://labtool.example/' })
        .expect(200)
      assert.deepStrictEqual(res.body, { logoutUrl: 'https://labtool.example/' })
    })

    it('combines the Shibboleth logout url and the return url', async () => {
      const res = await api
        .post('/api/logout')
        .set('shib_logout_url', 'https://login.example/Logout')
        .send({ returnUrl: 'https://labtool.example/' })
        .expect(200)
      assert.deepStrictEqual(res.body, { logoutUrl: 'https://login.example/Logout?return=https://labtool.example/' })
    })
  })

  describe('authentication middleware', () => {
    it('rejects requests without a token', async () => {
      const res = await api.get('/api/tags/list').expect(401)
      assert.strictEqual(res.body.message, 'you have to be authenticated')
    })

    it('rejects a token signed with another secret', async () => {
      const user = await createUser()
      const forged = jwt.sign({ username: user.username, id: user.id }, 'not-the-secret')
      await withToken(forged)
        .get('/api/tags/list')
        .expect(401)
    })

    it('rejects a malformed token', async () => {
      await withToken('garbage')
        .get('/api/tags/list')
        .expect(401)
    })

    it('accepts a token signed like login does', async () => {
      const user = await createUser()
      await as(user)
        .get('/api/tags/list')
        .expect(200)
    })

    it('reads the token from a lowercase "bearer" authorization header', async () => {
      const user = await createUser()
      const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)
      await api
        .get('/api/tags/list')
        .set('Authorization', `bearer ${token}`)
        .expect(200)
    })
  })

  describe('general routes', () => {
    it('GET /api returns the welcome message', async () => {
      const res = await api.get('/api').expect(200)
      assert.deepStrictEqual(res.body, { message: 'Welcome to the COURSES API!' })
    })

    it('GET /api/ping answers pong', async () => {
      const res = await api.get('/api/ping').expect(200)
      assert.deepStrictEqual(res.body, { message: 'pong' })
    })

    it('unknown GET routes return 404 JSON', async () => {
      const res = await as(await createUser()).get('/api/does-not-exist').expect(404)
      assert.deepStrictEqual(res.body, { message: 'Not found.' })
      // without a token every non-public API path answers 401 before routing
      await api.get('/api/does-not-exist').expect(401)
    })

    it('sets CORS headers', async () => {
      const res = await api.get('/api').expect(200)
      assert.strictEqual(res.headers['access-control-allow-origin'], '*')
      assert.ok(res.headers['access-control-allow-headers'].includes('Authorization'))
      assert.ok(res.headers['access-control-allow-methods'].includes('PUT'))
    })
  })
})
