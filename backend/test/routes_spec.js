const request = require('supertest')

describe('Express routes', () => {
  let server
  beforeEach(() => {
    server = require('../app')
  })

  afterEach(() => {
    server.close()
  })

  it('respond to /', (done) => {
    request(server)
      .get('/')
      .expect(200, done())
  })

  it('respond to /api', (done) => {
    request(server)
      .get('/api')
      .expect('{"message":"Welcome to the COURSES API!"}', done())
  })

  it('renders / with "hello world"', (done) => {
    request(server)
      .get('/')
      .expect('hello world', done())
  })

  it('404 everything else', (done) => {
    request(server)
      .get('/foo/bar')
      .expect(404, done())
  })
})
