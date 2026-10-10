const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { eventually } = require('./helpers/db')
const { StudentInstance } = require('../server/models')

const assignedTeacherOf = async (studentInstance) => {
  const fresh = await StudentInstance.findByPk(studentInstance.id)
  return fresh.teacherInstanceId
}

describe('Assistants API', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
  })

  describe('POST /api/course/assistant/create', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: s.assistant.id })
        .expect(401)
    })

    it('lets a teacher assign an assistant to a student', async () => {
      const res = await as(s.users.teacher)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: s.assistant.id })
        .expect(200)
      assert.strictEqual(res.body.id, s.student.id)
      await eventually(async () => assert.strictEqual(await assignedTeacherOf(s.student), s.assistant.id))
      assert.strictEqual(await assignedTeacherOf(s.student2), null)
    })

    it('unassigns the assistant when no teacher instance is given', async () => {
      await s.student.update({ teacherInstanceId: s.assistant.id })
      await as(s.users.assistant)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id })
        .expect(200)
      await eventually(async () => assert.strictEqual(await assignedTeacherOf(s.student), null))
    })

    it('is rejected for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: s.assistant.id })
        .expect(400)
      await as(s.users.otherTeacher)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: s.otherTeacher.id })
        .expect(400)
      assert.strictEqual(await assignedTeacherOf(s.student), null)
    })

    it('does not assign a teacher of another course', async () => {
      const res = await as(s.users.teacher)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: s.otherTeacher.id })
        .expect(400)
      assert.strictEqual(
        res.text,
        'You have to be an assistant or teacher in the same course as the teacher you are adding.'
      )
      assert.strictEqual(await assignedTeacherOf(s.student), null)
    })

    it('validates the student and teacher instances', async () => {
      await as(s.users.teacher)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: 999999, teacherInstanceId: s.assistant.id })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/course/assistant/create')
        .send({ studentInstanceId: s.student.id, teacherInstanceId: 999999 })
        .expect(400)
    })
  })

  describe('GET /api/course/assistant/student/:id', () => {
    it('requires authentication', async () => {
      await anonymous()
        .get(`/api/course/assistant/student/${s.student.id}`)
        .expect(401)
    })

    it('returns the assigned assistant to a teacher of the course', async () => {
      await s.student.update({ teacherInstanceId: s.assistant.id })
      const res = await as(s.users.teacher)
        .get(`/api/course/assistant/student/${s.student.id}`)
        .expect(200)
      assert.deepStrictEqual(res.body, {
        status: 'Student already has an assigned assistant.',
        data: { firsts: 'Antti', lastname: 'Assistant' }
      })
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await s.student.update({ teacherInstanceId: s.assistant.id })
      await as(s.users.student)
        .get(`/api/course/assistant/student/${s.student.id}`)
        .expect(403)
      await as(s.users.otherTeacher)
        .get(`/api/course/assistant/student/${s.student.id}`)
        .expect(403)
    })

    it('tells a teacher when no assistant has been assigned', async () => {
      const res = await as(s.users.teacher)
        .get(`/api/course/assistant/student/${s.student.id}`)
        .expect(200)
      assert.strictEqual(res.body.status, 'No assistant assigned to student.')
    })
  })
})
