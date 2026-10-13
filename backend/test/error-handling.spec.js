const assert = require('assert')
const { as, api } = require('./helpers/api')
const f = require('./helpers/factories')
const { User, StudentInstance } = require('../server/models')

/*
 * A rejected promise in an async handler used to be unhandled, which on Node 15+ crashes the whole
 * backend; any logged-in user could take it down with one malformed request. Errors must also never
 * be sent to the client as such: Sequelize errors contain SQL and its parameters.
 */
describe('Error handling', () => {
  let s
  let rejections
  const listener = reason => rejections.push(reason)

  beforeEach(async () => {
    s = await f.createScenario()
    rejections = []
    process.on('unhandledRejection', listener)
  })

  afterEach(() => {
    process.removeListener('unhandledRejection', listener)
  })

  const assertNoUnhandledRejections = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    assert.deepStrictEqual(rejections, [])
  }

  const assertNoSql = (res) => {
    assert.ok(!/select|insert|update|sql/i.test(res.text), `response leaks database details: ${res.text}`)
  }

  it('answers 404 instead of crashing for week drafts of an unknown student', async () => {
    await as(s.users.teacher)
      .post('/api/weeks/getDraft')
      .send({ studentInstanceId: 999999, weekNumber: 1 })
      .expect(404)
    await as(s.users.teacher)
      .post('/api/weeks/saveDraft')
      .send({ studentInstanceId: 999999, weekNumber: 1, reviewData: {} })
      .expect(404)
    await assertNoUnhandledRejections()
  })

  it('answers malformed requests without crashing or leaking details', async () => {
    const responses = [
      await as(s.users.student).post('/api/weeks/getDraft').send({}),
      await as(s.users.student).post('/api/comments').send({ week: 'abc' }),
      await as(s.users.teacher).post('/api/courseinstances/copy').send({ copyFrom: 'x', copyTo: 'y' })
    ]
    responses.forEach((res) => {
      assert.ok(res.status >= 400, `expected an error status, got ${res.status}`)
      assertNoSql(res)
    })
    assert.strictEqual(responses[0].status, 400)
    assert.deepStrictEqual(responses[0].body, { message: 'Missing or malformed inputs.' })
    await assertNoUnhandledRejections()
  })

  it('answers 500 { message } without details when a query fails', async () => {
    const { findByPk } = StudentInstance
    StudentInstance.findByPk = async () => {
      throw new Error('select * from "StudentInstances" where secret')
    }
    try {
      const res = await as(s.users.teacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 1 })
        .expect(500)
      assert.deepStrictEqual(res.body, { message: 'Unexpected error. Please try again.' })
      assertNoSql(res)
    } finally {
      StudentInstance.findByPk = findByPk
    }
    await assertNoUnhandledRejections()
  })

  it('validates the type of a new email address', async () => {
    const res = await as(s.users.student)
      .put('/api/users/update')
      .send({ email: ['@'] })
      .expect(400)
    assert.strictEqual(res.body.message, 'Email was too short.')
    await as(s.users.student)
      .put('/api/users/update')
      .send({ email: 'new@example.com' })
      .expect(201)
    assert.strictEqual((await User.findByPk(s.users.student.id)).email, 'new@example.com')
    await assertNoUnhandledRejections()
  })

  it('answers 400 to malformed JSON without details', async () => {
    const res = await api
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send('{"broken":')
      .expect(400)
    assert.deepStrictEqual(res.body, { message: 'Invalid request.' })
  })

  it('does not send database errors to the client', async () => {
    const res = await as(s.users.teacher)
      .post('/api/courseinstances/abc')
      .send({})
    assert.ok(res.status >= 400)
    assertNoSql(res)
  })
})
