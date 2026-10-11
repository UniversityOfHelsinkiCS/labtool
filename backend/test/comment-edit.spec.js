const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Comment } = require('../server/models')

describe('Editing comments (#534)', () => {
  let s
  let week
  let teacherComment
  let studentComment

  beforeEach(async () => {
    s = await f.createScenario()
    week = await f.createWeek(s.student, { weekNumber: 1, points: 2, feedback: 'Fine' })
    teacherComment = await f.createComment(week, s.users.teacher, { comment: 'Original', isRead: [s.users.teacher.id, s.users.student.id] })
    studentComment = await f.createComment(week, s.users.student, { comment: 'Question' })
  })

  const edit = (user, comment, text) => as(user).put(`/api/comment/${comment.id}`).send({ comment: text })

  it('lets the author edit the text, marks it edited and unread for the others', async () => {
    const res = await edit(s.users.teacher, teacherComment, 'Corrected').expect(200)
    assert.strictEqual(res.body.comment, 'Corrected')
    assert.ok(res.body.editedAt)

    await teacherComment.reload()
    assert.strictEqual(teacherComment.comment, 'Corrected')
    assert.ok(teacherComment.editedAt)
    assert.deepStrictEqual(teacherComment.isRead, [s.users.teacher.id])
  })

  it('lets a student edit their own comment', async () => {
    await edit(s.users.student, studentComment, 'Better question').expect(200)
    assert.strictEqual((await Comment.findByPk(studentComment.id)).comment, 'Better question')
  })

  it('does not let anyone edit someone else\'s comment', async () => {
    await edit(s.users.student, teacherComment, 'Hacked').expect(403)
    await edit(s.users.assistant, teacherComment, 'Hacked').expect(403)
    await edit(s.users.teacher, studentComment, 'Hacked').expect(403)
    assert.strictEqual((await Comment.findByPk(teacherComment.id)).comment, 'Original')
  })

  it('does not change visibility and rejects empty text', async () => {
    await teacherComment.update({ hidden: true })
    await as(s.users.teacher).put(`/api/comment/${teacherComment.id}`).send({ comment: 'Still hidden', hidden: false }).expect(200)
    assert.strictEqual((await Comment.findByPk(teacherComment.id)).hidden, true)

    await edit(s.users.teacher, teacherComment, '   ').expect(400)
  })

  it('requires authentication and an existing comment', async () => {
    await anonymous().put(`/api/comment/${teacherComment.id}`).send({ comment: 'x' }).expect(401)
    await edit(s.users.teacher, { id: 999999 }, 'x').expect(404)
  })
})
