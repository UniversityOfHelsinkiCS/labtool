describe('Login', function() {
  let User
  let server
  let supertest
  let should
  let jwt
  let assert
  let nock

  beforeEach(function() {
    User = require('../server/models').User
    server = require('../app')
    supertest = require('supertest')(server)
    nock = require('nock')
    nock.disableNetConnect = true

    should = require('should')
    jwt = require('jsonwebtoken')
    assert = require('assert')
  })
  afterEach(function() {
    server.close()
  })

  it('respond to /api/login with correct credentials', function(done) {
    process.env.SECRET = 'testest'
    let token = jwt.sign({ username: 'rkeskiva', id: 1 }, process.env.SECRET)
    nock('https://opetushallinto.cs.helsinki.fi')
      .post('/api/login')
      .reply(200, {
        username: 'rkeskiva',
        student_number: '0123456789',
        first_names: 'Raimo',
        last_name: 'Keski-Vääntö'
      })

    done()
  })

  it('respond to /login with incorrect credentials with "wrong credentials"', function(done) {
    nock('https://opetushallinto.cs.helsinki.fi')
      .post('/login')
      .reply(200, {
        error: 'wrong credentials'
      })
    supertest.post('/login').expect('{"body":{"error":"wrong credentials"}}', done())
  })

  it('respond to /login with correct credentials second time', function(done) {
    nock('https://opetushallinto.cs.helsinki.fi')
      .post('/login')
      .reply(200, {
        error: 'wrong credentials'
      })

    supertest
      .get('/admin')
      .expect('Content-type', /json/)
      .expect(200) // THis is HTTP response
      .end(function(err, res) {
        res.status.should.equal(401)

        done()
      })
  })
})
