const assert = require('assert')
const { api } = require('./helpers/api')

describe('Admin page (basic auth)', () => {
  it('asks for basic auth credentials when none are given', async () => {
    const res = await api.get('/admin').expect(401)
    assert.strictEqual(res.headers['www-authenticate'], 'Basic realm="labtooladmin"')
  })

  it('rejects a wrong password', async () => {
    await api
      .get('/admin')
      .auth('admin', 'wrong')
      .expect(401)
  })

  it('rejects a wrong user name', async () => {
    await api
      .get('/admin')
      .auth('root', process.env.ADMIN_PW)
      .expect(401)
  })

  it('shows the admin page with the ADMIN_PW password', async () => {
    const res = await api
      .get('/admin')
      .auth('admin', process.env.ADMIN_PW)
      .expect(200)
    assert.strictEqual(res.text, 'You have logged in as a backend admin. Sadly there is nothing here.')
  })

  it('redirects POSTs back to the referring page', async () => {
    const res = await api
      .post('/admin')
      .auth('admin', process.env.ADMIN_PW)
      .set('Referer', 'http://localhost/admin')
      .type('form')
      .send({ foo: 'bar' })
      .expect(302)
    assert.strictEqual(res.headers.location, 'http://localhost/admin')
  })

  it('rejects POSTs without credentials', async () => {
    await api
      .post('/admin')
      .type('form')
      .send({ foo: 'bar' })
      .expect(401)
  })
})
