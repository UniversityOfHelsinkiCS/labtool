const assert = require('assert')
const { api } = require('./helpers/api')

describe('Security headers', () => {
  it('are set on API responses, and Express is not advertised', async () => {
    const res = await api.get('/api').expect(200)
    assert.match(res.headers['content-security-policy'], /default-src 'self'/)
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff')
    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN')
    assert.match(res.headers['strict-transport-security'], /max-age=/)
    assert.strictEqual(res.headers['cross-origin-resource-policy'], 'same-site')
    assert.strictEqual(res.headers['x-powered-by'], undefined)
  })

  it('do not break CORS for the frontend', async () => {
    const res = await api.get('/api').expect(200)
    assert.strictEqual(res.headers['access-control-allow-origin'], '*')
  })
})
