let request = require('supertest')

describe('Express routes', function () {
  let server
  beforeEach(function () {
    server = require('../app')
  })
  afterEach(function () {
    server.close()
  })
  it('respond to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done)
  })
  it('respond to /api', function(done) {
    request(server).get('/api').expect('{"message":"Welcome to the COURSES API!"}', done)
  })

  it('respond to /api', function(done) {
    request(server).get('/api').expect('{"message":"Welcome to the COURSES API!"}', done)
  })


  it('renders / with "hello world"', function testHello(done) {
    request(server).get('/').expect('hello world', done)
  })

  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done())
  })

})