const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Week, ReviewNote } = require('../server/models')

// In the final review only the assigned instructor edits the review notes; the rest of the course staff
// add notes of their own, which students never see.
describe('Final review notes', () => {
  let s
  const FINAL = 8

  beforeEach(async () => {
    s = await f.createScenario()
    await s.course.update({ finalReview: true, weekAmount: 7 })
    // the assistant is the assigned instructor of the student
    await s.student.update({ teacherInstanceId: s.assistant.id })
    await f.createWeek(s.student, { weekNumber: FINAL, points: 5, instructorNotes: 'Notes by the instructor' })
  })

  const save = (user, body) => as(user)
    .post('/api/weeks/create')
    .send({ studentInstanceId: s.student.id, weekNumber: FINAL, checks: {}, confirmedNotAssigned: true, ...body })
  const notesNow = async () => (await Week.findOne({ where: { studentInstanceId: s.student.id, weekNumber: FINAL } })).instructorNotes
  const addNote = (user, body) => as(user)
    .post('/api/reviewnotes')
    .send({ studentInstanceId: s.student.id, weekNumber: FINAL, text: 'A note', ...body })

  describe('editing the review notes of the final review', () => {
    it('is allowed for the assigned instructor', async () => {
      await save(s.users.assistant, { instructorNotes: 'Edited by the instructor' }).expect(200)
      assert.strictEqual(await notesNow(), 'Edited by the instructor')
    })

    it('is refused for the rest of the staff, the teacher too', async () => {
      const res = await save(s.users.teacher, { instructorNotes: 'Edited by the teacher' }).expect(403)
      assert.strictEqual(res.body.code, 'NOTES_LOCKED')
      assert.strictEqual(await notesNow(), 'Notes by the instructor')
    })

    it('does not stop the others from saving the rest of the review with the notes unchanged or left out', async () => {
      await save(s.users.teacher, { instructorNotes: 'Notes by the instructor', points: 6 }).expect(200)
      await save(s.users.teacher, { points: 7 }).expect(200)
      const week = await Week.findOne({ where: { studentInstanceId: s.student.id, weekNumber: FINAL } })
      assert.strictEqual(week.points, 7)
      assert.strictEqual(week.instructorNotes, 'Notes by the instructor')
    })

    it('is open to everyone when the student has no assigned instructor', async () => {
      await s.student.update({ teacherInstanceId: null })
      await save(s.users.teacher, { instructorNotes: 'Edited by the teacher' }).expect(200)
      assert.strictEqual(await notesNow(), 'Edited by the teacher')
    })

    it('is open to everyone on a normal week', async () => {
      await f.createWeek(s.student, { weekNumber: 1, instructorNotes: 'Week 1 notes' })
      await save(s.users.teacher, { weekNumber: 1, instructorNotes: 'Edited week 1 notes' }).expect(200)
    })
  })

  describe('POST /api/reviewnotes', () => {
    it('adds a note by any staff member, shown to the staff with its author', async () => {
      const res = await addNote(s.users.teacher, { text: '  Agree with the grade.  ' }).expect(200)
      assert.strictEqual(res.body.text, 'Agree with the grade.')
      assert.strictEqual(res.body.by, `${s.users.teacher.firsts} ${s.users.teacher.lastname}`)
      await addNote(s.users.assistant, { text: 'Thanks' }).expect(200)

      const page = await as(s.users.teacher).post('/api/courseinstances/coursepage').send({ course: s.course.ohid }).expect(200)
      const student = page.body.data.find(si => si.id === s.student.id)
      assert.deepStrictEqual(student.reviewNotes.map(n => [n.weekNumber, n.text, n.by]), [
        [FINAL, 'Agree with the grade.', `${s.users.teacher.firsts} ${s.users.teacher.lastname}`],
        [FINAL, 'Thanks', `${s.users.assistant.firsts} ${s.users.assistant.lastname}`]
      ])
    })

    it('never shows the notes to the student', async () => {
      await addNote(s.users.teacher, { text: 'Secret staff note' }).expect(200)
      await s.course.update({ finalReviewVisible: true })
      const page = await as(s.users.student).post('/api/courseinstances/coursepage').send({ course: s.course.ohid }).expect(200)
      assert.ok(!JSON.stringify(page.body).includes('Secret staff note'))
    })

    it('is only for the final review', async () => {
      await addNote(s.users.teacher, { weekNumber: 1 }).expect(400)
    })

    it('is possible only once the review notes of the final review have been written', async () => {
      await Week.update({ instructorNotes: '  ' }, { where: { studentInstanceId: s.student.id, weekNumber: FINAL } })
      await addNote(s.users.teacher).expect(400)
      await Week.destroy({ where: { studentInstanceId: s.student.id, weekNumber: FINAL } })
      await addNote(s.users.teacher).expect(400)
      assert.strictEqual(await ReviewNote.count(), 0)
    })

    it('rejects an empty note', async () => {
      await addNote(s.users.teacher, { text: '   ' }).expect(400)
    })

    it('is not allowed for students, outsiders or anonymous users', async () => {
      await addNote(s.users.student).expect(403)
      await addNote(s.users.otherTeacher).expect(403)
      await anonymous().post('/api/reviewnotes').send({ studentInstanceId: s.student.id, weekNumber: FINAL, text: 'x' }).expect(401)
      assert.strictEqual(await ReviewNote.count(), 0)
    })
  })
})
