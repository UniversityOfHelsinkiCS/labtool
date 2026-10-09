const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Week, ReviewCheck, WeekDraft } = require('../server/models')

describe('Week reviews and drafts API', () => {
  let s
  let items

  beforeEach(async () => {
    s = await f.createScenario()
    const checklist = await f.createChecklist(s.course, {
      week: 1,
      items: {
        Code: [
          { name: 'Tests', checkedPoints: 1, uncheckedPoints: 0 },
          { name: 'Lint', checkedPoints: 0.5, uncheckedPoints: 0 }
        ]
      }
    })
    items = checklist.items // eslint-disable-line prefer-destructuring
  })

  const review = () => ({
    studentInstanceId: s.student.id,
    weekNumber: 1,
    points: 2.5,
    grade: null,
    feedback: 'Well done',
    instructorNotes: 'Seems to have copied the README',
    checks: { [items[0].id]: true, [items[1].id]: false }
  })

  describe('POST /api/weeks/create', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/weeks/create')
        .send(review())
        .expect(401)
    })

    it('lets a teacher create a week review with checklist checks', async () => {
      const res = await as(s.users.teacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(200)

      assert.strictEqual(res.body.points, 2.5)
      assert.strictEqual(res.body.feedback, 'Well done')
      assert.strictEqual(res.body.instructorNotes, 'Seems to have copied the README')
      assert.strictEqual(res.body.weekNumber, 1)
      assert.strictEqual(res.body.studentInstanceId, s.student.id)
      assert.deepStrictEqual(res.body.checks, { [items[0].id]: true, [items[1].id]: false })

      const weeks = await Week.findAll({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(weeks.length, 1)
      assert.strictEqual(weeks[0].points, 2.5)
      assert.strictEqual(weeks[0].notified, false)
      const checks = await ReviewCheck.findAll({ where: { weekId: weeks[0].id } })
      assert.deepStrictEqual(
        checks.map(c => [c.checklistItemId, c.checked]).sort((a, b) => a[0] - b[0]),
        [
          [items[0].id, true],
          [items[1].id, false]
        ]
      )
    })

    it('lets an assistant create a review and stores grades for final reviews', async () => {
      await as(s.users.assistant)
        .post('/api/weeks/create')
        .send({ ...review(), weekNumber: 8, points: '', grade: 4, checks: {} })
        .expect(200)
      const week = await Week.findOne({ where: { studentInstanceId: s.student.id, weekNumber: 8 } })
      assert.strictEqual(week.points, null)
      assert.strictEqual(week.grade, 4)
    })

    it('updates an existing review instead of creating a new one', async () => {
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(200)

      const res = await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({
          studentInstanceId: s.student.id,
          weekNumber: 1,
          points: 3,
          feedback: 'Even better after fixes',
          checks: { [items[1].id]: true }
        })
        .expect(200)
      assert.strictEqual(res.body.points, 3)
      assert.deepStrictEqual(res.body.checks, { [items[1].id]: true })

      const weeks = await Week.findAll({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(weeks.length, 1)
      assert.strictEqual(weeks[0].points, 3)
      assert.strictEqual(weeks[0].feedback, 'Even better after fixes')
      assert.strictEqual(weeks[0].instructorNotes, 'Seems to have copied the README') // not sent, kept
      const checks = await ReviewCheck.findAll({ where: { weekId: weeks[0].id } })
      assert.deepStrictEqual(
        checks.map(c => [c.checklistItemId, c.checked]).sort((a, b) => a[0] - b[0]),
        [
          [items[0].id, true],
          [items[1].id, true]
        ]
      )
    })

    it('removes the draft of the reviewed week', async () => {
      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 1, data: { points: 1 } })
      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 2, data: { points: 1 } })
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(200)
      const drafts = await WeekDraft.findAll({ where: { studentInstanceId: s.student.id } })
      assert.deepStrictEqual(
        drafts.map(d => d.weekNumber),
        [2]
      )
    })

    it('is rejected for students, including the reviewed student', async () => {
      await as(s.users.student)
        .post('/api/weeks/create')
        .send(review())
        .expect(400)
      await as(s.users.student2)
        .post('/api/weeks/create')
        .send(review())
        .expect(400)
      assert.strictEqual(await Week.count(), 0)
    })

    it('is rejected for a teacher of another course', async () => {
      const res = await as(s.users.otherTeacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(400)
      assert.strictEqual(res.text, 'You must be a teacher to give points.')
      assert.strictEqual(await Week.count(), 0)
    })
  })

  describe('week review drafts', () => {
    const draft = () => ({
      studentInstanceId: s.student.id,
      weekNumber: 2,
      reviewData: { points: 1.5, feedback: 'half way there', checks: { [items[0].id]: true } }
    })

    it('require authentication', async () => {
      await anonymous()
        .post('/api/weeks/saveDraft')
        .send(draft())
        .expect(401)
      await anonymous()
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(401)
    })

    it('lets a teacher save, update and read a draft', async () => {
      await as(s.users.teacher)
        .post('/api/weeks/saveDraft')
        .send(draft())
        .expect(200)
      let stored = await WeekDraft.findAll({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(stored.length, 1)
      assert.deepStrictEqual(stored[0].data, draft().reviewData)

      const updatedData = { points: 2, feedback: 'nearly done', checks: {} }
      await as(s.users.assistant)
        .post('/api/weeks/saveDraft')
        .send({ ...draft(), reviewData: updatedData })
        .expect(200)
      stored = await WeekDraft.findAll({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(stored.length, 1)
      assert.deepStrictEqual(stored[0].data, updatedData)

      const res = await as(s.users.teacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(200)
      assert.strictEqual(res.body.weekNumber, 2)
      assert.strictEqual(res.body.studentInstanceId, s.student.id)
      assert.deepStrictEqual(res.body.data, updatedData)
    })

    it('answers 204 when there is no draft', async () => {
      const res = await as(s.users.teacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 5 })
        .expect(204)
      assert.strictEqual(res.text, '')
    })

    it('is rejected for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/weeks/saveDraft')
        .send(draft())
        .expect(400)
      await as(s.users.otherTeacher)
        .post('/api/weeks/saveDraft')
        .send(draft())
        .expect(400)
      assert.strictEqual(await WeekDraft.count(), 0)

      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 2, data: { points: 1 } })
      await as(s.users.student)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(400)
      await as(s.users.otherTeacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(400)
    })
  })
})
