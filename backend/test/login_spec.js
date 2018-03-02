var supertest = require('supertest');
var nock = require('nock');
var request = require('request')

describe('loading express', function () {
    var server;
    beforeEach(function () {
        server = require('../app');

    });
    afterEach(function () {
        server.close();
    });

    before('fails to /login with wrong username and/or password', function () {
        nock('https://opetushallinto.cs.helsinki.fi')
            .matchHeader('accept', 'application/json')
            .post('/login')
            .reply(200, {
                error: "wrong credentials"
            });
    });

    it('fails to /login with wrong username and/or password', function testSlash(done) {

        supertest(server)
            .post('/login', {
                body: {
                    username: 'wrong',
                    password: 'wrong'
                }
            })
            .expect(401, done);  // I have no idea why this is, but atleast this works.. I see no packets
                                 // going to host 128.214.166.77 with tshark when running tests.
    });

});
