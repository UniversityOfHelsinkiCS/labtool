let request = require('supertest');
let nock = require('nock');
const jwt = require('jsonwebtoken')

describe('Login', function () {

    let server;
    beforeEach(function () {
        server = require('../app');
    });
    afterEach(function () {
        server.close();
    });

    it('respond to /login with incorrect credentials with "wrong credentials"', function(done) {
        nock.disableNetConnect=true
        nock("https://opetushallinto.cs.helsinki.fi").post('/login').reply(200, {
            error: 'wrong credentials'
        })
        process.env.SECRET = "testets"
        request(server).post('/login').expect('{"body":{"error":"wrong credentials"}}', done());
    })

    it('respond to /login with correct credentials', function(done) {

        nock.disableNetConnect=true
        const token = jwt.sign({ username: 'rkeskiva', id: 1 }, process.env.SECRET)

        nock("https://opetushallinto.cs.helsinki.fi").post('/login').reply(200, {
            username: 'rkeskiva',
            student_number: '0123456789',
            first_names: 'Raimo',
            last_name: 'Keski-Vääntö'
        })
        process.env.SECRET = "testets"
        request(server).post('/login').expect({
            returnedUser: {
                email: '',
                firsts: 'Raimo',
                lastname: 'Keski-Vääntö',
                username: 'rkeskiva',
            },
            token: token,
            created: false
        }, done());
    })

})