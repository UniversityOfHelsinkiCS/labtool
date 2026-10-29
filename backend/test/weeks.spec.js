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
        .expect(403)
      await as(s.users.student2)
        .post('/api/weeks/create')
        .send(review())
        .expect(403)
      assert.strictEqual(await Week.count(), 0)
    })

    it('is rejected for a teacher of another course', async () => {
      const res = await as(s.users.otherTeacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(403)
      assert.strictEqual(res.body.message, 'You must be a teacher to give points.')
      assert.strictEqual(await Week.count(), 0)
    })

    it('answers 404 for an unknown student and 400 for malformed input', async () => {
      const res = await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({ ...review(), studentInstanceId: 999999 })
        .expect(404)
      assert.strictEqual(res.body.message, 'Student not found.')
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({ ...review(), studentInstanceId: undefined })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({ ...review(), weekNumber: 'x' })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({ ...review(), checks: [true] })
        .expect(400)
      assert.strictEqual(await Week.count(), 0)
    })

    it('saves a new review without checks', async () => {
      const body = review()
      delete body.checks
      const res = await as(s.users.teacher)
        .post('/api/weeks/create')
        .send(body)
        .expect(200)
      assert.deepStrictEqual(res.body.checks, {})
      assert.strictEqual(await Week.count(), 1)
      assert.strictEqual(await ReviewCheck.count(), 0)
    })

    it('saves nothing when a part of the save fails', async () => {
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send(review())
        .expect(200)
      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 1, data: { points: 1 } })
      // a check id that is not a number fails in the database after the week has been updated
      await as(s.users.teacher)
        .post('/api/weeks/create')
        .send({ ...review(), points: 9, checks: { [items[0].id]: false, notAnId: true } })
        .expect(500)
      const week = await Week.findOne({ where: { studentInstanceId: s.student.id, weekNumber: 1 } })
      assert.strictEqual(week.points, 2.5)
      const check = await ReviewCheck.findOne({ where: { weekId: week.id, checklistItemId: items[0].id } })
      assert.strictEqual(check.checked, true)
      assert.strictEqual(await WeekDraft.count(), 1)
    })
  })

  describe('protection against overwriting another instructor\'s work (#1127)', () => {
    const save = (user, body) => as(user).post('/api/weeks/create').send({ ...review(), ...body })

    it('rejects a save based on an older version and says who saved it', async () => {
      const first = await save(s.users.teacher, { baseUpdatedAt: null }).expect(200)
      assert.strictEqual(first.body.updatedBy, s.users.teacher.id)

      // the assistant opened the page before the teacher saved, so they think there is no review yet
      const res = await save(s.users.assistant, { baseUpdatedAt: null, points: 1, feedback: 'Mine' }).expect(409)
      assert.strictEqual(res.body.code, 'REVIEW_CHANGED')
      assert.strictEqual(res.body.updatedBy, 'Terhi Teacher')
      assert.strictEqual(res.body.message, 'Terhi Teacher saved this review after you opened it.')
      assert.strictEqual(res.body.updatedAt, first.body.updatedAt)

      const week = await Week.findOne({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(week.points, 2.5)
      assert.strictEqual(week.feedback, 'Well done')
    })

    it('accepts a save based on the current version and records who saved it', async () => {
      const first = await save(s.users.teacher, { baseUpdatedAt: null }).expect(200)
      const second = await save(s.users.assistant, { baseUpdatedAt: first.body.updatedAt, points: 1 }).expect(200)
      assert.strictEqual(second.body.updatedBy, s.users.assistant.id)
      assert.notStrictEqual(second.body.updatedAt, first.body.updatedAt)
    })

    it('treats a change of only checklist checks as a new version', async () => {
      const first = await save(s.users.teacher, { baseUpdatedAt: null }).expect(200)
      const checksOnly = { [items[0].id]: false, [items[1].id]: true }
      const second = await save(s.users.teacher, { baseUpdatedAt: first.body.updatedAt, checks: checksOnly }).expect(200)
      assert.notStrictEqual(second.body.updatedAt, first.body.updatedAt)

      await save(s.users.assistant, { baseUpdatedAt: first.body.updatedAt }).expect(409)
    })

    it('saves anyway with overwrite', async () => {
      await save(s.users.teacher, { baseUpdatedAt: null }).expect(200)
      await save(s.users.assistant, { baseUpdatedAt: null, points: 1, overwrite: true }).expect(200)
      assert.strictEqual((await Week.findOne({ where: { studentInstanceId: s.student.id } })).points, 1)
    })

    describe('when the student has an assigned instructor', () => {
      beforeEach(async () => {
        await s.student.update({ teacherInstanceId: s.assistant.id })
      })

      it('asks someone else to confirm before changing the grading', async () => {
        const res = await save(s.users.teacher, { baseUpdatedAt: null }).expect(409)
        assert.strictEqual(res.body.code, 'NOT_ASSIGNED_INSTRUCTOR')
        assert.strictEqual(res.body.assignedInstructor, 'Antti Assistant')
        assert.strictEqual(res.body.message, 'Antti Assistant is the instructor of this student, not you.')
        assert.strictEqual(await Week.count(), 0)

        await save(s.users.teacher, { baseUpdatedAt: null, confirmedNotAssigned: true }).expect(200)
        assert.strictEqual(await Week.count(), 1)
      })

      it('does not ask the assigned instructor', async () => {
        await save(s.users.assistant, { baseUpdatedAt: null }).expect(200)
      })

      it('does not ask when only the instructor notes change', async () => {
        const first = await save(s.users.assistant, { baseUpdatedAt: null }).expect(200)
        await save(s.users.teacher, { baseUpdatedAt: first.body.updatedAt, instructorNotes: 'Checked the README too' })
          .expect(200)
        assert.strictEqual(
          (await Week.findOne({ where: { studentInstanceId: s.student.id } })).instructorNotes,
          'Checked the README too'
        )
      })

      it('asks when only checklist checks change', async () => {
        const first = await save(s.users.assistant, { baseUpdatedAt: null }).expect(200)
        const res = await save(s.users.teacher, {
          baseUpdatedAt: first.body.updatedAt,
          checks: { [items[0].id]: false, [items[1].id]: false }
        }).expect(409)
        assert.strictEqual(res.body.code, 'NOT_ASSIGNED_INSTRUCTOR')
      })
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
        .expect(403)
      const res = await as(s.users.otherTeacher)
        .post('/api/weeks/saveDraft')
        .send(draft())
        .expect(403)
      assert.strictEqual(res.body.message, 'You must be a teacher to save review drafts.')
      assert.strictEqual(await WeekDraft.count(), 0)

      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 2, data: { points: 1 } })
      await as(s.users.student)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: s.student.id, weekNumber: 2 })
        .expect(403)
    })

    it('answer 404 for an unknown student', async () => {
      await as(s.users.teacher)
        .post('/api/weeks/saveDraft')
        .send({ ...draft(), studentInstanceId: 999999 })
        .expect(404)
      await as(s.users.teacher)
        .post('/api/weeks/getDraft')
        .send({ studentInstanceId: 999999, weekNumber: 2 })
        .expect(404)
    })

    it('answers 400 for malformed review data', async () => {
      await as(s.users.teacher)
        .post('/api/weeks/saveDraft')
        .send({ ...draft(), reviewData: { checks: [1] } })
        .expect(400)
      assert.strictEqual(await WeekDraft.count(), 0)
    })
  })

  describe('protection of drafts against overwriting another instructor\'s work (#1127)', () => {
    const saveDraft = (user, body) => as(user).post('/api/weeks/saveDraft').send({
      studentInstanceId: s.student.id,
      weekNumber: 1,
      reviewData: { points: 1, feedback: 'half way', checks: { [items[0].id]: true } },
      ...body
    })
    const save = (user, body) => as(user).post('/api/weeks/create').send({ ...review(), ...body })

    it('records who saved the draft', async () => {
      const res = await saveDraft(s.users.teacher, { baseDraftUpdatedAt: null }).expect(200)
      assert.strictEqual(res.body.updatedBy, s.users.teacher.id)
    })

    it('rejects a draft based on an older draft and says who saved it', async () => {
      const first = await saveDraft(s.users.teacher, { baseDraftUpdatedAt: null }).expect(200)

      const res = await saveDraft(s.users.assistant, {
        baseDraftUpdatedAt: null,
        reviewData: { points: 2, feedback: 'Mine', checks: {} }
      }).expect(409)
      assert.strictEqual(res.body.code, 'REVIEW_CHANGED')
      assert.strictEqual(res.body.message, 'Terhi Teacher saved a draft of this review after you opened it.')
      assert.strictEqual(res.body.updatedAt, first.body.updatedAt)
      assert.strictEqual((await WeekDraft.findOne()).data.feedback, 'half way')

      await saveDraft(s.users.assistant, { baseDraftUpdatedAt: first.body.updatedAt }).expect(200)
    })

    it('rejects a draft when the review was saved after the page was opened', async () => {
      await save(s.users.teacher, { baseUpdatedAt: null }).expect(200)
      const res = await saveDraft(s.users.assistant, { baseUpdatedAt: null, baseDraftUpdatedAt: null }).expect(409)
      assert.strictEqual(res.body.message, 'Terhi Teacher saved this review after you opened it.')
      assert.strictEqual(await WeekDraft.count(), 0)
    })

    it('rejects a review save that would remove a draft saved after the page was opened', async () => {
      await saveDraft(s.users.teacher, { baseDraftUpdatedAt: null }).expect(200)
      const res = await save(s.users.assistant, { baseUpdatedAt: null, baseDraftUpdatedAt: null }).expect(409)
      assert.strictEqual(res.body.message, 'Terhi Teacher saved a draft of this review after you opened it.')
      assert.strictEqual(await WeekDraft.count(), 1)
      assert.strictEqual(await Week.count(), 0)
    })

    it('saves anyway with overwrite', async () => {
      await saveDraft(s.users.teacher, { baseDraftUpdatedAt: null }).expect(200)
      await saveDraft(s.users.assistant, {
        baseDraftUpdatedAt: null,
        overwrite: true,
        reviewData: { points: 2, checks: {} }
      }).expect(200)
      assert.strictEqual((await WeekDraft.findOne()).data.points, 2)
    })

    describe('when the student has an assigned instructor', () => {
      beforeEach(async () => {
        await s.student.update({ teacherInstanceId: s.assistant.id })
      })

      it('asks someone else to confirm before a draft changes the grading', async () => {
        const res = await saveDraft(s.users.teacher).expect(409)
        assert.strictEqual(res.body.code, 'NOT_ASSIGNED_INSTRUCTOR')
        assert.strictEqual(res.body.message, 'Antti Assistant is the instructor of this student, not you.')
        assert.strictEqual(await WeekDraft.count(), 0)

        await saveDraft(s.users.teacher, { confirmedNotAssigned: true }).expect(200)
        assert.strictEqual(await WeekDraft.count(), 1)
      })

      it('does not ask the assigned instructor', async () => {
        await saveDraft(s.users.assistant).expect(200)
      })

      it('compares the draft with the saved review when there is no earlier draft', async () => {
        await save(s.users.assistant, {}).expect(200)
        // the same grading as the review, only the notes differ
        await saveDraft(s.users.teacher, {
          reviewData: {
            points: '2.5', grade: '', feedback: 'Well done', instructorNotes: 'Also checked the tests',
            checks: { [items[0].id]: true, [items[1].id]: false }
          }
        }).expect(200)
      })

      it('compares the draft with the earlier draft', async () => {
        await saveDraft(s.users.assistant).expect(200)
        await saveDraft(s.users.teacher, {
          reviewData: { points: 1, feedback: 'half way', instructorNotes: 'note', checks: { [items[0].id]: true } }
        }).expect(200)
        const res = await saveDraft(s.users.teacher, {
          reviewData: { points: 1, feedback: 'half way', checks: { [items[0].id]: false } }
        }).expect(409)
        assert.strictEqual(res.body.code, 'NOT_ASSIGNED_INSTRUCTOR')
      })
    })
  })
})
