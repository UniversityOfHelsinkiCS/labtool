const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Tag, StudentTag } = require('../server/models')

describe('Tags API', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
  })

  describe('POST /api/tags/create', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/tags/create')
        .send({ text: 'new', courseInstanceId: s.course.id })
        .expect(401)
    })

    it('lets a teacher create a course tag', async () => {
      const res = await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ text: '  late  ', color: 'red', courseInstanceId: s.course.id })
        .expect(200)
      assert.strictEqual(res.body.name, 'late')
      assert.strictEqual(res.body.color, 'red')
      assert.strictEqual(res.body.courseInstanceId, s.course.id)

      const tags = await Tag.findAll()
      assert.deepStrictEqual(
        tags.map(t => [t.name, t.color, t.courseInstanceId]),
        [['late', 'red', s.course.id]]
      )
    })

    it('lets any teacher create a global tag, gray by default', async () => {
      const res = await as(s.users.otherTeacher)
        .post('/api/tags/create')
        .send({ text: 'global' })
        .expect(200)
      assert.strictEqual(res.body.courseInstanceId, null)
      assert.strictEqual(res.body.color, 'gray')
      assert.strictEqual(await Tag.count({ where: { courseInstanceId: null } }), 1)
    })

    it('updates an existing tag', async () => {
      const tag = await f.createTag({ name: 'old', color: 'red', courseInstanceId: s.course.id })
      const res = await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ id: tag.id, text: 'renamed', color: 'blue', courseInstanceId: s.course.id })
        .expect(200)
      assert.strictEqual(res.body.id, tag.id)
      assert.strictEqual(res.body.name, 'renamed')
      await tag.reload()
      assert.strictEqual(tag.name, 'renamed')
      assert.strictEqual(tag.color, 'blue')
    })

    it('merges a course tag into an identical global tag when made global', async () => {
      const global = await f.createTag({ name: 'merge me', color: 'red', courseInstanceId: null })
      const local = await f.createTag({ name: 'local', color: 'red', courseInstanceId: s.course.id })
      await StudentTag.create({ studentInstanceId: s.student.id, tagId: local.id })

      const res = await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ id: local.id, text: 'merge me', color: 'red' })
        .expect(200)
      assert.deepStrictEqual(res.body, {
        id: global.id,
        name: 'merge me',
        color: 'red',
        courseInstanceId: null,
        deleteId: local.id
      })
      assert.strictEqual(await Tag.findByPk(local.id), null)
      const studentTags = await StudentTag.findAll()
      assert.deepStrictEqual(
        studentTags.map(st => st.tagId),
        [global.id]
      )
    })

    it('copies a global tag to other courses using it when it is made a course tag', async () => {
      const global = await f.createTag({ name: 'shared', color: 'red', courseInstanceId: null })
      const foreignStudent = await f.addStudent(await f.createUser(), s.otherCourse)
      await StudentTag.create({ studentInstanceId: s.student.id, tagId: global.id })
      await StudentTag.create({ studentInstanceId: foreignStudent.id, tagId: global.id })

      await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ id: global.id, text: 'shared', color: 'red', courseInstanceId: s.course.id })
        .expect(200)

      await global.reload()
      assert.strictEqual(global.courseInstanceId, s.course.id)
      const copy = await Tag.findOne({ where: { courseInstanceId: s.otherCourse.id } })
      assert.strictEqual(copy.name, 'shared')
      const foreignTag = await StudentTag.findOne({ where: { studentInstanceId: foreignStudent.id } })
      assert.strictEqual(foreignTag.tagId, copy.id)
      const ownTag = await StudentTag.findOne({ where: { studentInstanceId: s.student.id } })
      assert.strictEqual(ownTag.tagId, global.id)
    })

    it('rejects duplicate and empty names', async () => {
      await f.createTag({ name: 'taken', courseInstanceId: s.course.id })
      const res = await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ text: 'taken', courseInstanceId: s.course.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'Tag taken already exists')
      await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ text: '   ', courseInstanceId: s.course.id })
        .expect(400)
      assert.strictEqual(await Tag.count(), 1)
    })

    it('is forbidden for students and for teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/tags/create')
        .send({ text: 'nope' })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/tags/create')
        .send({ text: 'nope', courseInstanceId: s.course.id })
        .expect(403)
      assert.strictEqual(await Tag.count(), 0)
    })

    it('does not let staff of another course edit, move or globalize a course tag by its id', async () => {
      const tag = await f.createTag({ name: 'theirs', color: 'red', courseInstanceId: s.course.id })
      for (const body of [
        { id: tag.id, text: 'hijacked' },
        { id: tag.id, text: 'hijacked', courseInstanceId: s.otherCourse.id }
      ]) {
        await as(s.users.otherTeacher)
          .post('/api/tags/create')
          .send(body)
          .expect(403)
      }
      await tag.reload()
      assert.strictEqual(tag.name, 'theirs')
      assert.strictEqual(tag.courseInstanceId, s.course.id)
    })

    it('lets only responsible teachers (not assistants) edit a global tag', async () => {
      const tag = await f.createTag({ name: 'global', courseInstanceId: null })
      await as(s.users.assistant)
        .post('/api/tags/create')
        .send({ id: tag.id, text: 'renamed by assistant' })
        .expect(403)
      await as(s.users.assistant)
        .post('/api/tags/create')
        .send({ id: tag.id, text: 'made a course tag', courseInstanceId: s.course.id })
        .expect(403)
      await tag.reload()
      assert.strictEqual(tag.name, 'global')
      assert.strictEqual(tag.courseInstanceId, null)

      await as(s.users.otherTeacher)
        .post('/api/tags/create')
        .send({ id: tag.id, text: 'renamed' })
        .expect(200)
    })

    it('answers 404 when editing a tag that does not exist', async () => {
      await as(s.users.teacher)
        .post('/api/tags/create')
        .send({ id: 999999, text: 'x', courseInstanceId: s.course.id })
        .expect(404)
    })
  })

  describe('GET /api/tags/list', () => {
    it('requires authentication', async () => {
      await anonymous()
        .get('/api/tags/list')
        .expect(401)
    })

    it('lists all tags', async () => {
      await f.createTag({ name: 'one', courseInstanceId: s.course.id })
      await f.createTag({ name: 'two', courseInstanceId: null })
      const res = await as(s.users.student)
        .get('/api/tags/list')
        .expect(200)
      assert.deepStrictEqual(res.body.map(t => t.name).sort(), ['one', 'two'])
    })
  })

  describe('tagging students', () => {
    let tag

    beforeEach(async () => {
      tag = await f.createTag({ name: 'star', color: 'yellow', courseInstanceId: s.course.id })
    })

    it('require authentication', async () => {
      await anonymous()
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(401)
      await anonymous()
        .post('/api/tags/untagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(401)
    })

    it('lets a teacher tag a student and returns the updated student', async () => {
      const res = await as(s.users.assistant)
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(200)
      assert.strictEqual(res.body.id, s.student.id)
      assert.strictEqual(res.body.User.username, 'student')
      assert.deepStrictEqual(
        res.body.Tags.map(t => [t.id, t.name, t.color]),
        [[tag.id, 'star', 'yellow']]
      )
      assert.ok(Array.isArray(res.body.weeks))
      assert.ok(Array.isArray(res.body.codeReviews))

      // tagging twice does not duplicate
      await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(200)
      assert.strictEqual(await StudentTag.count(), 1)
    })

    it('lets a teacher remove a tag from a student', async () => {
      await StudentTag.create({ studentInstanceId: s.student.id, tagId: tag.id })
      const res = await as(s.users.teacher)
        .post('/api/tags/untagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(200)
      assert.deepStrictEqual(res.body.Tags, [])
      assert.strictEqual(await StudentTag.count(), 0)
      assert.ok(await Tag.findByPk(tag.id))
    })

    it('is rejected for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(403)
      assert.strictEqual(await StudentTag.count(), 0)

      await StudentTag.create({ studentInstanceId: s.student.id, tagId: tag.id })
      await as(s.users.student)
        .post('/api/tags/untagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/tags/untagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(403)
      assert.strictEqual(await StudentTag.count(), 1)
    })

    it('does not attach a tag of another course', async () => {
      const foreignTag = await f.createTag({ name: 'foreign', courseInstanceId: s.otherCourse.id })
      const res = await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: foreignTag.id, studentId: s.student.id })
        .expect(400)
      assert.strictEqual(res.body.message, 'The tag is not a tag of the course of the student.')
      assert.strictEqual(await StudentTag.count(), 0)
    })

    it('attaches a global tag to a student of any course', async () => {
      const globalTag = await f.createTag({ name: 'everywhere', courseInstanceId: null })
      await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: globalTag.id, studentId: s.student.id })
        .expect(200)
      assert.strictEqual(await StudentTag.count(), 1)
    })

    it('validates the tag and the student', async () => {
      await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ studentId: s.student.id })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: 999999, studentId: s.student.id })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/tags/tagStudent')
        .send({ tagId: tag.id, studentId: 999999 })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/tags/untagStudent')
        .send({ studentId: s.student.id })
        .expect(400)
      assert.strictEqual(await StudentTag.count(), 0)
    })

    it('answers 400 when removing a tag the student does not have', async () => {
      await as(s.users.teacher)
        .post('/api/tags/untagStudent')
        .send({ tagId: tag.id, studentId: s.student.id })
        .expect(400)
    })
  })

  describe('POST /api/tags/remove', () => {
    it('requires authentication', async () => {
      const tag = await f.createTag({ courseInstanceId: s.course.id })
      await anonymous()
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(401)
    })

    it('lets a teacher remove a course tag together with its student tags', async () => {
      const tag = await f.createTag({ courseInstanceId: s.course.id })
      await StudentTag.create({ studentInstanceId: s.student.id, tagId: tag.id })

      const res = await as(s.users.teacher)
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(200)
      assert.strictEqual(res.text, String(tag.id))
      assert.strictEqual(await Tag.findByPk(tag.id), null)
      assert.strictEqual(await StudentTag.count(), 0)
    })

    it('lets a responsible teacher of any course remove a global tag', async () => {
      const tag = await f.createTag({ courseInstanceId: null })
      await as(s.users.otherTeacher)
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(200)
      assert.strictEqual(await Tag.count(), 0)
    })

    it('does not let an assistant remove a global tag', async () => {
      const tag = await f.createTag({ courseInstanceId: null })
      await as(s.users.assistant)
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(403)
      assert.ok(await Tag.findByPk(tag.id))
    })

    it('is rejected for students and teachers of other courses', async () => {
      const tag = await f.createTag({ courseInstanceId: s.course.id })
      await as(s.users.student)
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/tags/remove')
        .send({ id: tag.id })
        .expect(403)
      assert.ok(await Tag.findByPk(tag.id))
    })

    it('answers 404 for an unknown tag', async () => {
      await as(s.users.teacher)
        .post('/api/tags/remove')
        .send({ id: 999999 })
        .expect(404)
    })
  })
})
