const assert = require('assert')
const { as } = require('./helpers/api')
const f = require('./helpers/factories')
const { stubMailTransport } = require('./helpers/mailer')
const { CourseInstance } = require('../server/models')

// The final review is the week after the last one; its results stay hidden from students until shown.
describe('Hiding the final review from students', () => {
  let s
  let finalReview
  let week1
  let mail

  beforeEach(async () => {
    s = await f.createScenario()
    await s.course.update({ finalReview: true, weekAmount: 7 })
    week1 = await f.createWeek(s.student, { weekNumber: 1, points: 2 })
    finalReview = await f.createWeek(s.student, { weekNumber: 8, points: 5, grade: 4, feedback: 'Final feedback' })
    await f.createComment(finalReview, s.users.teacher, { comment: 'About the final review' })
    mail = stubMailTransport()
  })

  afterEach(() => {
    mail.restore()
  })

  const show = visible => s.course.update({ finalReviewVisible: visible })
  const studentWeeks = async () => {
    const res = await as(s.users.student)
      .post('/api/courseinstances/coursepage')
      .send({ course: s.course.ohid })
      .expect(200)
    return res.body.data.weeks.map(week => week.weekNumber).sort()
  }

  it('hides the final review of new courses by default', async () => {
    const course = await f.createCourse({ finalReview: true })
    assert.strictEqual((await CourseInstance.findByPk(course.id)).finalReviewVisible, false)
  })

  it('leaves the hidden final review out of the student\'s course page', async () => {
    assert.deepStrictEqual(await studentWeeks(), [1])
    const res = await as(s.users.student).post('/api/courseinstances/coursepage').send({ course: s.course.ohid })
    assert.ok(!JSON.stringify(res.body).includes('Final feedback'))
    assert.ok(!JSON.stringify(res.body).includes('About the final review'))
  })

  it('shows the final review to the student once it is shown', async () => {
    await show(true)
    assert.deepStrictEqual(await studentWeeks(), [1, 8])
  })

  it('always shows the final review to the course staff', async () => {
    const res = await as(s.users.assistant)
      .post('/api/courseinstances/coursepage')
      .send({ course: s.course.ohid })
      .expect(200)
    const student = res.body.data.find(si => si.id === s.student.id)
    assert.deepStrictEqual(student.weeks.map(week => week.weekNumber).sort(), [1, 8])
  })

  it('does not hide week 8 of a course without a final review', async () => {
    await s.course.update({ finalReview: false, weekAmount: 8 })
    assert.deepStrictEqual(await studentWeeks(), [1, 8])
  })

  it('does not let the student comment on the hidden final review', async () => {
    await as(s.users.student)
      .post('/api/comment')
      .send({ week: finalReview.id, comment: 'Can I see it?', hidden: false })
      .expect(403)
    await as(s.users.student)
      .post('/api/comment')
      .send({ week: week1.id, comment: 'Week 1 is fine', hidden: false })
      .expect(200)
  })

  it('does not email the student about the hidden final review', async () => {
    const comment = await f.createComment(finalReview, s.users.teacher, { comment: 'Email me' })
    for (const body of [{ weekId: finalReview.id }, { commentId: comment.id }]) {
      // eslint-disable-next-line no-await-in-loop
      const res = await as(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', ...body })
        .expect(400)
      assert.match(res.body.message, /hidden from students/)
    }
    await show(true)
    await as(s.users.teacher).post('/api/email/send').send({ role: 'teacher', weekId: finalReview.id }).expect(200)
  })

  it('lets the teacher show and hide the final review in the course settings', async () => {
    const update = visible => as(s.users.teacher)
      .put(`/api/courseinstances/${s.course.ohid}`)
      .send({ active: true, weekAmount: 7, weekMaxPoints: 3, currentWeek: 1, finalReview: true, finalReviewVisible: visible, newCr: [] })
      .expect(200)
    await update(true)
    assert.strictEqual((await CourseInstance.findByPk(s.course.id)).finalReviewVisible, true)
    await update(false)
    assert.strictEqual((await CourseInstance.findByPk(s.course.id)).finalReviewVisible, false)
  })

  it('keeps the setting when an update does not mention it', async () => {
    await show(true)
    await as(s.users.teacher)
      .put(`/api/courseinstances/${s.course.ohid}`)
      .send({ active: true, weekAmount: 7, weekMaxPoints: 3, currentWeek: 1, finalReview: true, newCr: [] })
      .expect(200)
    assert.strictEqual((await CourseInstance.findByPk(s.course.id)).finalReviewVisible, true)
  })
})
