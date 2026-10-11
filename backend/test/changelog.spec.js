const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { ChangeLog, CodeReview } = require('../server/models')

describe('Change history (#1129, #1132)', () => {
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

  const history = user => as(user).get(`/api/changelog/${s.student.id}`)
  const logged = kind => ChangeLog.findAll({ where: { studentInstanceId: s.student.id, kind }, order: [['id', 'ASC']] })

  describe('week reviews', () => {
    const review = body => as(s.users.teacher).post('/api/weeks/create').send({
      studentInstanceId: s.student.id,
      weekNumber: 1,
      points: 2.5,
      feedback: 'Well done',
      instructorNotes: 'Copied the README',
      checks: { [items[0].id]: true, [items[1].id]: false },
      ...body
    })

    it('logs who changed what, with the full texts', async () => {
      await review().expect(200)
      await review({ points: 3, feedback: 'Well done, tests too', checks: { [items[0].id]: true, [items[1].id]: true } })
        .expect(200)

      const [first, second] = await logged('week_review')
      assert.strictEqual(first.number, 1)
      assert.strictEqual(first.userId, s.users.teacher.id)
      assert.deepStrictEqual(first.changes.points, { from: null, to: 2.5 })
      assert.deepStrictEqual(first.changes.feedback, { from: null, to: 'Well done' })
      assert.deepStrictEqual(first.changes.instructorNotes, { from: null, to: 'Copied the README' })
      assert.deepStrictEqual(first.changes.checklist, [{ id: items[0].id, name: 'Tests', from: false, to: true }])

      assert.deepStrictEqual(second.changes, {
        points: { from: 2.5, to: 3 },
        feedback: { from: 'Well done', to: 'Well done, tests too' },
        checklist: [{ id: items[1].id, name: 'Lint', from: false, to: true }]
      })
    })

    it('does not log a save that changes nothing', async () => {
      await review().expect(200)
      await review().expect(200)
      assert.strictEqual((await logged('week_review')).length, 1)
    })
  })

  describe('code review grading', () => {
    it('logs points and checklist changes', async () => {
      const cl = await f.createChecklist(s.course, {
        forCodeReview: true,
        items: { Review: [{ name: 'Found bugs', checkedPoints: 1, uncheckedPoints: 0 }] }
      })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
      await as(s.users.teacher).put('/api/codereviews/grade').send({
        studentInstanceId: s.student.id,
        reviewNumber: 1,
        points: 2,
        checks: [{ id: cl.items[0].id, checked: true }]
      }).expect(200)

      const [entry] = await logged('code_review_grade')
      assert.strictEqual(entry.number, 1)
      assert.deepStrictEqual(entry.changes, {
        points: { from: null, to: 2 },
        checklist: [{ id: cl.items[0].id, name: 'Found bugs', from: false, to: true }]
      })
    })
  })

  describe('repository links', () => {
    it('logs the repository given at registration', async () => {
      await as(s.users.outsider).post(`/api/course/register/${s.course.ohid}`)
        .send({ github: 'https://github.com/outsider/first', projectName: 'Outsider project' })
        .expect(200)
      const [entry] = await ChangeLog.findAll({ where: { kind: 'repository', userId: s.users.outsider.id } })
      assert.deepStrictEqual(entry.changes, { github: { from: null, to: 'https://github.com/outsider/first' } })
    })

    it('logs a student changing their repository, but not a save that keeps it', async () => {
      const old = s.student.github
      await as(s.users.student).post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, github: 'https://github.com/student/moved' })
        .expect(200)
      await as(s.users.student).post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, projectName: 'Renamed only' })
        .expect(200)

      const entries = await logged('repository')
      assert.strictEqual(entries.length, 1)
      assert.strictEqual(entries[0].userId, s.users.student.id)
      assert.deepStrictEqual(entries[0].changes, { github: { from: old, to: 'https://github.com/student/moved' } })
    })

    it('logs a teacher changing repositories in a bulk update', async () => {
      const old = s.student.github
      await as(s.users.teacher).post('/api/studentinstance/massupdate')
        .send({ ohid: s.course.ohid, studentInstances: [{ userId: s.users.student.id, github: 'https://github.com/x/by-teacher' }] })
        .expect(200)
      const [entry] = await logged('repository')
      assert.strictEqual(entry.userId, s.users.teacher.id)
      assert.deepStrictEqual(entry.changes, { github: { from: old, to: 'https://github.com/x/by-teacher' } })
    })
  })

  describe('repository of a code review', () => {
    it('keeps the repository that was assigned and reviewed when the reviewee changes theirs', async () => {
      const assigned = s.student2.github
      await as(s.users.teacher).put('/api/codereviews/bulkinsert').send({
        reviewNumber: 1,
        courseId: s.course.id,
        codeReviews: [{ reviewer: s.student.id, toReview: s.student2.id }]
      }).expect(201)
      await as(s.users.student).put('/api/codereviews/link').send({
        studentInstanceId: s.student.id,
        reviewNumber: 1,
        linkToReview: 'https://github.com/student2/project/issues/1'
      }).expect(200)
      await as(s.users.student2).post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, github: 'https://github.com/student2/brand-new' })
        .expect(200)

      const review = await CodeReview.findOne({ where: { studentInstanceId: s.student.id, reviewNumber: 1 } })
      assert.strictEqual(review.repoAtAssignment, assigned)
      assert.strictEqual(review.repoAtLinkAdded, assigned)
    })

    it('uses the link itself for a review of an arbitrary repository', async () => {
      await as(s.users.teacher).put('/api/codereviews/bulkinsert').send({
        reviewNumber: 1,
        courseId: s.course.id,
        codeReviews: [{ reviewer: s.student.id, repoToReview: 'https://github.com/somewhere/else' }]
      }).expect(201)
      const review = await CodeReview.findOne({ where: { studentInstanceId: s.student.id, reviewNumber: 1 } })
      assert.strictEqual(review.repoAtAssignment, 'https://github.com/somewhere/else')
    })
  })

  describe('GET /api/changelog/:studentInstanceId', () => {
    beforeEach(async () => {
      await as(s.users.teacher).post('/api/weeks/create').send({
        studentInstanceId: s.student.id, weekNumber: 1, points: 1, feedback: 'First', checks: {}
      }).expect(200)
      await as(s.users.assistant).post('/api/weeks/create').send({
        studentInstanceId: s.student.id, weekNumber: 1, points: 2, feedback: 'Second', checks: {}
      }).expect(200)
    })

    it('gives course staff the history, newest first, with who made each change', async () => {
      const res = await history(s.users.assistant).expect(200)
      assert.deepStrictEqual(res.body.map(entry => entry.by), ['Antti Assistant', 'Terhi Teacher'])
      assert.deepStrictEqual(res.body[0].changes.points, { from: 1, to: 2 })
      assert.strictEqual(res.body[0].kind, 'week_review')
      assert.strictEqual(res.body[0].number, 1)
      assert.ok(res.body[0].createdAt)
    })

    it('is not available to students, other teachers or anonymous users', async () => {
      await history(s.users.student).expect(403)
      await history(s.users.otherTeacher).expect(403)
      await anonymous().get(`/api/changelog/${s.student.id}`).expect(401)
      await as(s.users.teacher).get('/api/changelog/999999').expect(404)
    })
  })
})
