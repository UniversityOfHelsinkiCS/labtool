const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { eventually } = require('./helpers/db')
const { stubMailTransport, mailAs, mailApi } = require('./helpers/mailer')
const { Week, Comment } = require('../server/models')

describe('Email API', () => {
  let s
  let week
  let mail

  beforeEach(async () => {
    s = await f.createScenario()
    week = await f.createWeek(s.student, { weekNumber: 1, points: 2.5, feedback: 'Great <b>job</b>\nkeep going' })
    mail = stubMailTransport()
  })

  afterEach(() => {
    mail.restore()
  })

  describe('outside production (simulated sending)', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(401)
      await anonymous()
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }], content: 'x' })
        .expect(401)
    })

    it('simulates the notification and marks the week as notified without touching SMTP', async () => {
      const res = await as(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(200)
      assert.strictEqual(res.body.message, 'Email sending simulated.')
      assert.strictEqual(mail.sent.length, 0)
      await eventually(async () => assert.strictEqual((await Week.findByPk(week.id)).notified, true))
    })
  })

  describe('POST /api/email/send (real sending path, stubbed transport)', () => {
    it('sends to the server in SMTP_HOST / SMTP_PORT also in development, e.g. a local Mailpit', async () => {
      const devWithSmtp = { NODE_ENV: 'development', SMTP_HOST: 'mailpit', SMTP_PORT: '1025' }
      const res = await mailAs(s.users.teacher, devWithSmtp)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(200)
      assert.strictEqual(res.body.message, 'Email sent successfully.')
      assert.strictEqual(mail.transports[0].host, 'mailpit')
      assert.strictEqual(mail.transports[0].port, 1025)
      assert.strictEqual(mail.sent.length, 1)
    })

    it('requires authentication', async () => {
      await mailApi()
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(401)
      assert.strictEqual(mail.sent.length, 0)
    })

    it('emails a week review to the student via the university SMTP server', async () => {
      const res = await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(200)
      assert.strictEqual(res.body.message, 'Email sent successfully.')

      assert.strictEqual(mail.transports.length, 1)
      assert.strictEqual(mail.transports[0].host, 'smtp.helsinki.fi')
      assert.strictEqual(mail.transports[0].port, 587)
      assert.strictEqual(mail.sent.length, 1)
      const [message] = mail.sent
      assert.strictEqual(message.to, s.users.student.email)
      assert.strictEqual(message.from, 'Labtool Robot <noreply@helsinki.fi>')
      assert.strictEqual(message.subject, `${s.course.name} new message`)
      assert.ok(message.html.includes('<h1>Your submission has been reviewed</h1>'))
      assert.ok(message.html.includes('<p>points awarded: 2.5</p>'))
      assert.ok(message.html.includes(`/courses/${s.course.ohid}`))
      assert.ok(message.html.includes('Great &lt;b&gt;job&lt;/b&gt;<br>keep going'), 'feedback is escaped')

      await eventually(async () => assert.strictEqual((await Week.findByPk(week.id)).notified, true))
    })

    it('shows floating point points rounded in the email (#508)', async () => {
      await week.update({ points: 0.1 + 0.2 })
      await mailAs(s.users.teacher).post('/api/email/send').send({ role: 'teacher', weekId: week.id }).expect(200)
      assert.ok(mail.sent[0].html.includes('<p>points awarded: 0.3</p>'))
    })

    it('emails a teacher comment to the student', async () => {
      const comment = await f.createComment(week, s.users.teacher, { comment: 'See my notes' })
      await mailAs(s.users.assistant)
        .post('/api/email/send')
        .send({ role: 'teacher', commentId: comment.id })
        .expect(200)

      assert.strictEqual(mail.sent.length, 1)
      assert.strictEqual(mail.sent[0].to, s.users.student.email)
      assert.ok(mail.sent[0].html.includes('See my notes'))
      await eventually(async () => assert.strictEqual((await Comment.findByPk(comment.id)).notified, true))
    })

    it('does not email a hidden (instructors only) comment to the student', async () => {
      const comment = await f.createComment(week, s.users.teacher, { comment: 'Probably copied', hidden: true })
      const res = await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', commentId: comment.id })
        .expect(400)
      assert.match(res.text, /hidden/)
      assert.strictEqual(mail.sent.length, 0)
      assert.strictEqual((await Comment.findByPk(comment.id)).notified, false)
    })

    it('emails a student comment to the assigned assistant', async () => {
      await s.student.update({ teacherInstanceId: s.assistant.id })
      const comment = await f.createComment(week, s.users.student, { comment: 'Question about week 1' })

      await mailAs(s.users.student)
        .post('/api/email/send')
        .send({ role: 'student', commentId: comment.id })
        .expect(200)

      assert.strictEqual(mail.sent.length, 1)
      assert.strictEqual(mail.sent[0].to, s.users.assistant.email)
      assert.ok(mail.sent[0].html.includes(`/browsereviews/${s.course.ohid}/${s.student.id}`))
    })

    it('refuses a student notification when no assistant is assigned', async () => {
      const comment = await f.createComment(week, s.users.student)
      await mailAs(s.users.student)
        .post('/api/email/send')
        .send({ role: 'student', commentId: comment.id })
        .expect(400)
      assert.strictEqual(mail.sent.length, 0)
    })

    it('does not let a student notify about another student\'s comment', async () => {
      await s.student.update({ teacherInstanceId: s.assistant.id })
      const comment = await f.createComment(week, s.users.student)
      const res = await mailAs(s.users.student2)
        .post('/api/email/send')
        .send({ role: 'student', commentId: comment.id })
        .expect(403)
      assert.strictEqual(res.body.message, 'You cannot send an email notification about someone else\'s comment.')
      assert.strictEqual(mail.sent.length, 0)
    })

    it('does not let a student send week review notifications', async () => {
      await mailAs(s.users.student)
        .post('/api/email/send')
        .send({ role: 'student', weekId: week.id })
        .expect(400)
      assert.strictEqual(mail.sent.length, 0)
    })

    it('is forbidden for a teacher of another course', async () => {
      await mailAs(s.users.otherTeacher)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(403)
      assert.strictEqual(mail.sent.length, 0)
      assert.strictEqual((await Week.findByPk(week.id)).notified, false)
    })

    it('validates the request', async () => {
      await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ weekId: week.id })
        .expect(400)
      await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher' })
        .expect(400)
      assert.strictEqual(mail.sent.length, 0)
    })

    it('reports recipients rejected by the SMTP server', async () => {
      mail.restore()
      mail = stubMailTransport({ rejectAll: true })
      const res = await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(400)
      assert.strictEqual(
        res.body.message,
        `The mail server rejected the address ${s.users.student.email}; the notification was not sent.`
      )
      assert.strictEqual((await Week.findByPk(week.id)).notified, false)
    })

    it('reports a student without an email address', async () => {
      await s.users.student.update({ email: null })
      const res = await mailAs(s.users.teacher)
        .post('/api/email/send')
        .send({ role: 'teacher', weekId: week.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'The recipient has no email address; the notification was not sent.')
      assert.strictEqual(mail.sent.length, 0)
    })
  })

  describe('POST /api/email/sendmass/:ohid', () => {
    it('sends one bcc email to the selected students of the course', async () => {
      const res = await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }, { id: s.student2.id }], content: 'Deadline moved' })
        .expect(200)
      assert.strictEqual(res.body.message, 'Email sent successfully.')

      assert.strictEqual(mail.sent.length, 1)
      const [message] = mail.sent
      assert.deepStrictEqual(message.bcc.sort(), [s.users.student.email, s.users.student2.email].sort())
      assert.strictEqual(message.to, undefined)
      assert.strictEqual(message.subject, `${s.course.name} new message from instructor`)
      assert.ok(message.html.includes('Deadline moved'))
    })

    it('includes the instructors when asked to', async () => {
      await mailAs(s.users.assistant)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }], content: 'Hello', sendToInstructors: true })
        .expect(200)
      assert.deepStrictEqual(
        mail.sent[0].bcc.sort(),
        [s.users.student.email, s.users.teacher.email, s.users.assistant.email].sort()
      )
    })

    it('ignores students of other courses', async () => {
      const foreign = await f.addStudent(await f.createUser(), s.otherCourse)
      await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }, { id: foreign.id }], content: 'Hello' })
        .expect(200)
      assert.deepStrictEqual(mail.sent[0].bcc, [s.users.student.email])

      await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: foreign.id }], content: 'Hello' })
        .expect(404)
      assert.strictEqual(mail.sent.length, 1)
    })

    describe('when some recipients cannot be reached (#1141)', () => {
      const name = user => `${user.firsts} ${user.lastname}`

      it('sends to the others and names the rejected students', async () => {
        mail.restore()
        mail = stubMailTransport({ reject: [s.users.student2.email] })
        const res = await mailAs(s.users.teacher)
          .post(`/api/email/sendmass/${s.course.ohid}`)
          .send({ students: [{ id: s.student.id }, { id: s.student2.id }], content: 'Hello' })
          .expect(200)

        assert.deepStrictEqual(mail.sent[0].bcc.sort(), [s.users.student.email, s.users.student2.email].sort())
        assert.deepStrictEqual(res.body.notDelivered, [
          {
            name: name(s.users.student2),
            email: s.users.student2.email,
            studentInstanceId: s.student2.id,
            reason: 'rejected by the mail server'
          }
        ])
        assert.strictEqual(
          res.body.message,
          `Email sent to 1 of 2 recipients. Not delivered to: ${name(s.users.student2)} (${s.users.student2.email}, rejected by the mail server).`
        )
      })

      it('names students without an email address', async () => {
        await s.users.student2.update({ email: null })
        const res = await mailAs(s.users.teacher)
          .post(`/api/email/sendmass/${s.course.ohid}`)
          .send({ students: [{ id: s.student.id }, { id: s.student2.id }], content: 'Hello' })
          .expect(200)
        assert.deepStrictEqual(mail.sent[0].bcc, [s.users.student.email])
        assert.deepStrictEqual(res.body.notDelivered, [
          { name: name(s.users.student2), email: null, studentInstanceId: s.student2.id, reason: 'no email address' }
        ])
        assert.strictEqual(
          res.body.message,
          `Email sent to 1 of 2 recipients. Not delivered to: ${name(s.users.student2)} (no email address).`
        )
      })

      it('answers 400 and names everybody when every address is rejected', async () => {
        mail.restore()
        mail = stubMailTransport({ rejectAll: true })
        const res = await mailAs(s.users.teacher)
          .post(`/api/email/sendmass/${s.course.ohid}`)
          .send({ students: [{ id: s.student.id }, { id: s.student2.id }], content: 'Hello' })
          .expect(400)
        assert.strictEqual(mail.sent.length, 0)
        assert.deepStrictEqual(res.body.notDelivered.map(r => r.email).sort(), [s.users.student.email, s.users.student2.email].sort())
        assert.ok(res.body.message.startsWith('No email was sent. Not delivered to: '))
      })
    })

    it('is forbidden for students and teachers of other courses', async () => {
      const body = { students: [{ id: s.student.id }], content: 'Spam' }
      await mailAs(s.users.student)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send(body)
        .expect(403)
      await mailAs(s.users.otherTeacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send(body)
        .expect(403)
      assert.strictEqual(mail.sent.length, 0)
    })

    it('validates the request', async () => {
      await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ content: 'x' })
        .expect(400)
      await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }] })
        .expect(400)
      await mailAs(s.users.teacher)
        .post(`/api/email/sendmass/${s.course.ohid}`)
        .send({ students: [{ id: s.student.id }], content: 'x'.repeat(4097) })
        .expect(400)
      await mailAs(s.users.teacher)
        .post('/api/email/sendmass/nope')
        .send({ students: [{ id: s.student.id }], content: 'x' })
        .expect(404)
      assert.strictEqual(mail.sent.length, 0)
    })
  })
})
