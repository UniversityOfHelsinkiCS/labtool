const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { CourseInstance } = require('../server/models')

// A course registered or imported by mistake can be marked invalid (#905).
describe('Invalid courses', () => {
  let s
  let sysop
  let week

  beforeEach(async () => {
    s = await f.createScenario()
    sysop = await f.createUser({ username: 'sysop', sysop: true })
    week = await f.createWeek(s.student, { weekNumber: 1 })
  })

  const mark = (user, invalid, ohid = s.course.ohid) => as(user)
    .put(`/api/courseinstances/${ohid}/invalid`)
    .send({ invalid })
  const invalidate = () => s.course.update({ invalid: true })

  describe('PUT /api/courseinstances/:ohid/invalid', () => {
    it('lets the teacher of the course mark it invalid and valid again', async () => {
      const res = await mark(s.users.teacher, true).expect(200)
      assert.deepStrictEqual(res.body, { ohid: s.course.ohid, invalid: true })
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).invalid, true)
      await mark(s.users.teacher, false).expect(200)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).invalid, false)
    })

    it('lets a sysop mark any course', async () => {
      await mark(sysop, true).expect(200)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).invalid, true)
    })

    it('does not let assistants, students, other teachers or anonymous users mark it', async () => {
      for (const user of [s.users.assistant, s.users.student, s.users.otherTeacher, s.users.outsider]) {
        // eslint-disable-next-line no-await-in-loop
        await mark(user, true).expect(403)
      }
      await anonymous().put(`/api/courseinstances/${s.course.ohid}/invalid`).send({ invalid: true }).expect(401)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).invalid, false)
    })

    it('rejects a missing value and an unknown course', async () => {
      await mark(s.users.teacher, 'yes').expect(400)
      await mark(s.users.teacher, true, 'NOPE.2026').expect(404)
    })

    it('is not changed by the course settings update', async () => {
      await invalidate()
      await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ active: true, weekAmount: 7, weekMaxPoints: 3, currentWeek: 1, finalReview: false, newCr: [], invalid: false })
        .expect(200)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).invalid, true)
    })
  })

  describe('a course marked invalid', () => {
    beforeEach(invalidate)

    const listedFor = async (user) => {
      const res = await as(user).get('/api/courseinstances').expect(200)
      return res.body.some(course => course.id === s.course.id)
    }

    it('is listed only for its staff and sysops', async () => {
      assert.strictEqual(await listedFor(s.users.teacher), true)
      assert.strictEqual(await listedFor(s.users.assistant), true)
      assert.strictEqual(await listedFor(sysop), true)
      assert.strictEqual(await listedFor(s.users.student), false)
      assert.strictEqual(await listedFor(s.users.otherTeacher), false)
      await anonymous().get('/api/courseinstances').expect(401)
    })

    it('disappears from the courses of its students', async () => {
      const res = await as(s.users.student).post('/api/course/student').expect(200)
      assert.ok(!res.body.some(course => course.ohid === s.course.ohid))
    })

    it('is not found by its students', async () => {
      await as(s.users.student).get(`/api/courses/${s.course.ohid}`).expect(404)
      await as(s.users.student).get(`/api/courseinstances/${s.course.ohid}`).expect(404)
      await as(s.users.student).post('/api/courseinstances/coursepage').send({ course: s.course.ohid }).expect(404)
    })

    it('is still open to its staff and sysops', async () => {
      await as(s.users.assistant).get(`/api/courses/${s.course.ohid}`).expect(200)
      const res = await as(s.users.teacher).post('/api/courseinstances/coursepage').send({ course: s.course.ohid }).expect(200)
      assert.strictEqual(res.body.role, 'teacher')
      await as(sysop).get(`/api/courses/${s.course.ohid}`).expect(200)
    })

    it('cannot be registered to', async () => {
      await as(s.users.outsider).post(`/api/course/register/${s.course.ohid}`).send({}).expect(404)
    })

    it('cannot be commented on by its students', async () => {
      await as(s.users.student).post('/api/comment').send({ week: week.id, comment: 'Hello?', hidden: false }).expect(403)
    })

    it('is not offered for copying checklists', async () => {
      await f.createChecklist(s.course, { items: { Code: [{ name: 'Item', checkedPoints: 1, uncheckedPoints: 0 }] } })
      const res = await as(s.users.teacher).get('/api/checklist/copyable').expect(200)
      assert.ok(!res.body.some(c => c.courseInstanceId === s.course.id))
      await s.course.update({ invalid: false })
      const valid = await as(s.users.teacher).get('/api/checklist/copyable').expect(200)
      assert.ok(valid.body.some(c => c.courseInstanceId === s.course.id))
    })
  })
})
