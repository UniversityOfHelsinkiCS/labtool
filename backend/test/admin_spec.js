describe('Admin page', function() {
  let server
  let supertest
  let nock
  let should

  beforeEach(function() {
    server = require('../app')
    supertest = require('supertest')(server)
    nock = require('nock')
    nock.disableNetConnect = true
    nock('https://opetushallinto.cs.helsinki.fi')
      .get('/labtool/courses?year=2018&term=K')
      .reply(200, '[{"name":"Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)","starts":"2018-03-12 00:00:00 +0300","ends":"2018-03-12 00:00:00 +0300","id":"TKT20011.2018.K.A.1"}]')
      .get('/labtool/courses?year=2018&term=V')
      .reply(200, '[]')
    should = require('should')
  })
  afterEach(function() {
    nock.cleanAll()
    server.close()
  })

  it('should return 404 without basic authentication', function(done) {
    supertest
      .get('/admin')
      .expect(401)
      .end(function(err, res) {
        res.status.should.equal(401)
        done()
      })
  })
  it('should return 200 with basic auth correct credentials', function(done) {
    supertest
      .get('/admin')
      .auth('admin', 'test')
      .expect(200)
      .end(function(err, res) {
        res.status.should.equal(200)
        done()
      })
  })
  it('should return 401 with basic auth incorrect credentials', function(done) {
    supertest
      .get('/admin')
      .auth('admin', 'wrong')
      .expect(401)
      .end(function(err, res) {
        res.status.should.equal(401)
        done()
      })
  })
/*This test is commented because of continuing development of index.pug
  it('with correct credentials page should show a course to be activated', function(done) {
    supertest
      .get('/admin')
      .auth('admin', 'test')
      .expect(200)
      .expect('Tietokantasovellus (periodi IV)')

      .end(function(err, res) {
        res.text.should.eql(
          '<html><head><title>Activate course</title></head><body><h1>Not activated courses</h1><form method="POST"><p>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV) - TKT20011.2018.K.A.1</p><input name="hid" type="hidden" value="TKT20011.2018.K.A.1"/><input name="cname" type="hidden" value="Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)"/><input name="starts" type="hidden" value="2018-03-12 00:00:00 +0300"/><input name="ends" type="hidden" value="2018-03-12 00:00:00 +0300"/><input type="submit" value="Activate"/></form></body></html>'
        )
        done()
      })
  })
  */
})
