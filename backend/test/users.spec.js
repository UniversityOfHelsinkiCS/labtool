const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const { createScenario, createUser } = require('./helpers/factories')
const { eventually } = require('./helpers/db')
const { User, TeacherInstance, StudentInstance } = require('../server/models')

describe('Users API', () => {
  let s

  beforeEach(async () => {
    s = await createScenario()
  })

  describe('GET /api/users', () => {
    it('requires authentication', async () => {
      await anonymous()
        .get('/api/users')
        .expect(401)
    })

    it('is not available to students', async () => {
      const res = await as(s.users.student)
        .get('/api/users')
        .expect(403)
      assert.strictEqual(res.body.message, 'Unauthorized.')
    })

    it('lists all users for a teacher without student numbers or timestamps', async () => {
      const res = await as(s.users.teacher)
        .get('/api/users')
        .expect(200)

      assert.strictEqual(res.body.length, 6)
      const usernames = res.body.map(u => u.username).sort()
      assert.deepStrictEqual(usernames, ['assistant', 'otherteacher', 'outsider', 'student', 'student2', 'teacher'])
      res.body.forEach((user) => {
        assert.ok(!('studentNumber' in user))
        assert.ok(!('createdAt' in user))
        assert.ok('firsts' in user)
        assert.ok('email' in user)
      })
    })

    it('lists users without email addresses for an assistant', async () => {
      const res = await as(s.users.assistant)
        .get('/api/users')
        .expect(200)
      assert.strictEqual(res.body.length, 6)
      res.body.forEach((user) => {
        assert.ok(!('email' in user))
        assert.ok('firsts' in user)
      })
    })

    it('lists users for a sysop who teaches nothing', async () => {
      const sysop = await createUser({ sysop: true })
      const res = await as(sysop)
        .get('/api/users')
        .expect(200)
      assert.strictEqual(res.body.length, 7)
      assert.ok(res.body.every(user => 'email' in user))
    })
  })

  describe('PUT /api/users/update', () => {
    it('requires authentication', async () => {
      await anonymous()
        .put('/api/users/update')
        .send({ email: 'x@example.com' })
        .expect(401)
    })

    it('updates the email of the requesting user', async () => {
      const res = await as(s.users.student)
        .put('/api/users/update')
        .send({ email: 'changed@example.com' })
        .expect(201)

      assert.deepStrictEqual(res.body, {
        email: 'changed@example.com',
        firsts: 'Sanna',
        lastname: 'Student',
        studentNumber: s.users.student.studentNumber,
        username: 'student'
      })
      await eventually(async () => {
        const user = await User.findByPk(s.users.student.id)
        assert.strictEqual(user.email, 'changed@example.com')
      })
      const other = await User.findByPk(s.users.student2.id)
      assert.notStrictEqual(other.email, 'changed@example.com')
    })

    it('rejects invalid emails', async () => {
      let res = await as(s.users.student)
        .put('/api/users/update')
        .send({ email: '' })
        .expect(400)
      assert.deepStrictEqual(res.body, { message: 'Email was too short.' })
      res = await as(s.users.student)
        .put('/api/users/update')
        .send({ email: 'no-at-sign' })
        .expect(400)
      assert.deepStrictEqual(res.body, { message: 'Input was not a valid email address.' })
      res = await as(s.users.student)
        .put('/api/users/update')
        .send({ email: `${'a'.repeat(130)}@x.fi` })
        .expect(400)
      assert.deepStrictEqual(res.body, { message: 'Email was too long.' })

      const user = await User.findByPk(s.users.student.id)
      assert.strictEqual(user.email, s.users.student.email)
    })
  })

  describe('PUT /api/users/updateAdmin', () => {
    it('requires authentication', async () => {
      await anonymous()
        .put('/api/users/updateAdmin')
        .send({ id: s.users.student.id, sysop: true })
        .expect(401)
    })

    it('is forbidden for non-sysops, including teachers', async () => {
      await as(s.users.teacher)
        .put('/api/users/updateAdmin')
        .send({ id: s.users.teacher.id, sysop: true })
        .expect(403)
        .expect(res => assert.strictEqual(res.body.message, 'You must be a sysop.'))
      const user = await User.findByPk(s.users.teacher.id)
      assert.strictEqual(user.sysop, false)
    })

    it('lets a sysop grant and revoke sysop rights', async () => {
      const sysop = await createUser({ sysop: true })

      const res = await as(sysop)
        .put('/api/users/updateAdmin')
        .send({ id: s.users.student.id, sysop: true })
        .expect(200)
      assert.strictEqual(res.body.id, s.users.student.id)
      assert.strictEqual(res.body.sysop, true)
      assert.strictEqual((await User.findByPk(s.users.student.id)).sysop, true)

      await as(sysop)
        .put('/api/users/updateAdmin')
        .send({ id: s.users.student.id, sysop: false })
        .expect(200)
      assert.strictEqual((await User.findByPk(s.users.student.id)).sysop, false)
    })

    it('validates the target user', async () => {
      const sysop = await createUser({ sysop: true })
      let res = await as(sysop)
        .put('/api/users/updateAdmin')
        .send({ sysop: true })
        .expect(400)
      assert.strictEqual(res.body.message, 'You must provide a user ID.')
      res = await as(sysop)
        .put('/api/users/updateAdmin')
        .send({ id: 999999, sysop: true })
        .expect(400)
      assert.strictEqual(res.body.message, 'User not found.')
    })
  })

  describe('POST /api/users/teacher/create', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.outsider.id })
        .expect(401)
    })

    it('lets a teacher of the course add an assistant', async () => {
      const res = await as(s.users.teacher)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.outsider.id })
        .expect(200)

      assert.strictEqual(res.body.userId, s.users.outsider.id)
      assert.strictEqual(res.body.courseInstanceId, s.course.id)
      assert.strictEqual(res.body.instructor, true)
      const ti = await TeacherInstance.findOne({
        where: { userId: s.users.outsider.id, courseInstanceId: s.course.id }
      })
      assert.ok(ti)
      assert.strictEqual(ti.instructor, true)
    })

    it('lets an assistant of the course add another assistant', async () => {
      await as(s.users.assistant)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.outsider.id })
        .expect(200)
    })

    it('lets a sysop add an assistant to any course', async () => {
      const sysop = await createUser({ sysop: true })
      await as(sysop)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.outsider.id })
        .expect(200)
    })

    it('is rejected for students and for teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.student.id })
        .expect(403)
      const res = await as(s.users.otherTeacher)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.otherTeacher.id })
        .expect(403)
      assert.strictEqual(res.body.message, 'You must be a teacher on the course to add assistants.')

      assert.strictEqual(await TeacherInstance.count({ where: { courseInstanceId: s.course.id } }), 2)
    })

    it('does not add the same teacher twice', async () => {
      const res = await as(s.users.teacher)
        .post('/api/users/teacher/create')
        .send({ ohid: s.course.ohid, id: s.users.assistant.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'This user is already a teacher.')
      assert.strictEqual(await TeacherInstance.count({ where: { userId: s.users.assistant.id } }), 1)
    })

    it('fails for an unknown or missing course or user', async () => {
      const bodies = [
        { ohid: 'nope', id: s.users.outsider.id },
        { ohid: s.course.ohid, id: 999999 },
        { id: s.users.outsider.id },
        { ohid: s.course.ohid }
      ]
      for (const body of bodies) {
        const res = await as(s.users.teacher)
          .post('/api/users/teacher/create')
          .send(body)
          .expect(400)
        assert.strictEqual(res.body.message, 'User or course not found.')
      }
    })
  })

  describe('POST /api/users/teacher/remove', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.assistant.id })
        .expect(401)
    })

    it('lets a teacher of the course remove an assistant', async () => {
      const res = await as(s.users.teacher)
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.assistant.id })
        .expect(200)
      assert.strictEqual(res.body.userId, s.users.assistant.id)
      assert.strictEqual(await TeacherInstance.count({ where: { userId: s.users.assistant.id } }), 0)
    })

    it('is rejected for students and for teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.assistant.id })
        .expect(403)
      const res = await as(s.users.otherTeacher)
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.assistant.id })
        .expect(403)
      assert.strictEqual(res.body.message, 'You must teach or assist on the course to remove assistants.')
      assert.strictEqual(await TeacherInstance.count({ where: { userId: s.users.assistant.id } }), 1)
    })

    it('fails when the user is not a teacher on the course', async () => {
      const res = await as(s.users.teacher)
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.student.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'This user is not a teacher.')
    })

    it('does not allow removing the teacher responsible for the course', async () => {
      const res = await as(s.users.assistant)
        .post('/api/users/teacher/remove')
        .send({ ohid: s.course.ohid, id: s.users.teacher.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'Only assistants can be removed.')
      assert.strictEqual(await TeacherInstance.count({ where: { userId: s.users.teacher.id } }), 1)
    })
  })

  describe('POST /api/users/student/remove', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(401)
    })

    it('lets a student remove their own invalid registration', async () => {
      await s.student.update({ validRegistration: false })
      const res = await as(s.users.student)
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(200)
      assert.strictEqual(res.text, 'The student instance was deleted.')
      assert.strictEqual(await StudentInstance.findByPk(s.student.id), null)
    })

    it('lets a teacher of the course remove an invalid registration', async () => {
      await s.student.update({ validRegistration: false })
      await as(s.users.teacher)
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(200)
      assert.strictEqual(await StudentInstance.findByPk(s.student.id), null)
    })

    it('refuses to remove a valid registration', async () => {
      await as(s.users.teacher)
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(400)
      assert.ok(await StudentInstance.findByPk(s.student.id))
    })

    it('is forbidden for other students and teachers of other courses', async () => {
      await s.student.update({ validRegistration: false })
      await as(s.users.student2)
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/users/student/remove')
        .send({ id: s.student.id })
        .expect(403)
      assert.ok(await StudentInstance.findByPk(s.student.id))
    })

    it('fails for an unknown or missing student instance', async () => {
      let res = await as(s.users.teacher)
        .post('/api/users/student/remove')
        .send({ id: 999999 })
        .expect(400)
      assert.strictEqual(res.body.message, 'The student instance does not exist.')
      res = await as(s.users.teacher)
        .post('/api/users/student/remove')
        .send({})
        .expect(400)
      assert.strictEqual(res.body.message, 'The student instance does not exist.')
    })
  })
})
