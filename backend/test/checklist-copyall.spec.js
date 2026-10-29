const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Checklist, ChecklistItem } = require('../server/models')

// A course without any checklists can copy all checklists of another course at once.
describe('POST /api/checklist/copyall', () => {
  let s
  let source

  const item = (name, fields = {}) => ({ name, checkedPoints: 1, uncheckedPoints: 0, ...fields })
  const copyAll = (user, body) => as(user).post('/api/checklist/copyall').send(body)
  const checklistsOf = async (course) => {
    const checklists = await Checklist.findAll({ where: { courseInstanceId: course.id } })
    const withItems = await Promise.all(checklists.map(async c => ({
      week: c.week,
      forCodeReview: c.forCodeReview,
      maxPoints: c.maxPoints,
      items: (await ChecklistItem.findAll({ where: { checklistId: c.id }, order: [['order', 'ASC']] }))
    })))
    return withItems.sort((a, b) => (a.forCodeReview - b.forCodeReview) || (a.week - b.week))
  }

  beforeEach(async () => {
    s = await f.createScenario()
    await s.course.update({ weekAmount: 3, finalReview: true })
    // an earlier run of the course, taught by the same teacher
    source = await f.createCourse({ weekAmount: 3, finalReview: true })
    await f.addTeacher(s.users.teacher, source)
    const { items: [base] } = await f.createChecklist(source, { week: 1, maxPoints: 2, items: { Code: [item('Base', { description: 'The basics' })] } })
    const week1 = await Checklist.findOne({ where: { courseInstanceId: source.id, week: 1 } })
    await ChecklistItem.create({ checklistId: week1.id, category: 'Code', order: 2, name: 'Advanced', checkedPoints: 1, uncheckedPoints: 0, textWhenOn: '', textWhenOff: '', prerequisite: base.id })
    await f.createChecklist(source, { week: 2, items: { Docs: [item('README')] } })
    await f.createChecklist(source, { week: 4, items: { Final: [item('Demo')] } }) // the final review
    await f.createChecklist(source, { forCodeReview: true, items: { Review: [item('Useful comments')] } })
    await f.createChecklist(source, { week: 3 }) // empty: not copied
  })

  it('copies every checklist with its items, descriptions and prerequisites', async () => {
    const res = await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(200)
    assert.deepStrictEqual(res.body.copied.sort(), ['code review', 'final review', 'week 1', 'week 2'])
    assert.deepStrictEqual(res.body.skipped, [])
    assert.deepStrictEqual(
      res.body.checklists.map(c => [c.courseInstanceId, c.week, c.forCodeReview]).sort(),
      [[s.course.id, 1, false], [s.course.id, 2, false], [s.course.id, 4, false], [s.course.id, null, true]].sort()
    )

    const copied = await checklistsOf(s.course)
    assert.deepStrictEqual(copied.map(c => [c.week, c.forCodeReview, c.items.map(i => i.name)]), [
      [1, false, ['Base', 'Advanced']],
      [2, false, ['README']],
      [4, false, ['Demo']],
      [null, true, ['Useful comments']]
    ])
    const [week1] = copied
    assert.strictEqual(week1.maxPoints, 2)
    assert.strictEqual(week1.items[0].description, 'The basics')
    // the prerequisite points to the copied item, not to the original one
    assert.strictEqual(week1.items[1].prerequisite, week1.items[0].id)
    // the source is left as it was
    assert.strictEqual((await checklistsOf(source)).length, 5)
  })

  it('puts the final review checklist on the final review, and skips weeks the course does not have', async () => {
    await s.course.update({ weekAmount: 1, finalReview: true })
    const res = await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(200)
    assert.deepStrictEqual(res.body.copied.sort(), ['code review', 'final review', 'week 1'])
    assert.deepStrictEqual(res.body.skipped, ['week 2'])
    const final = (await checklistsOf(s.course)).find(c => c.items[0] && c.items[0].name === 'Demo')
    assert.strictEqual(final.week, 2)
  })

  it('skips the final review when the course has none', async () => {
    await s.course.update({ finalReview: false })
    const res = await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(200)
    assert.deepStrictEqual(res.body.skipped, ['final review'])
  })

  it('replaces empty checklists but refuses when the course already has a checklist', async () => {
    await f.createChecklist(s.course, { week: 1 })
    await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(200)
    assert.strictEqual((await checklistsOf(s.course)).filter(c => c.week === 1).length, 1)

    await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(409)
  })

  it('lets assistants copy, but only from their own courses', async () => {
    await copyAll(s.users.assistant, { copyFrom: source.id, copyTo: s.course.id }).expect(403)
    await f.addTeacher(s.users.assistant, source, { instructor: true })
    await copyAll(s.users.assistant, { copyFrom: source.id, copyTo: s.course.id }).expect(200)
  })

  it('does not copy from a course the user is only a student on', async () => {
    await f.addStudent(s.users.assistant, source)
    const res = await copyAll(s.users.assistant, { copyFrom: source.id, copyTo: s.course.id }).expect(403)
    assert.strictEqual(res.body.message, 'You can only copy checklists from your own courses.')
    assert.strictEqual((await checklistsOf(s.course)).length, 0)
  })

  it('is not allowed for students, outsiders or anonymous users', async () => {
    await copyAll(s.users.student, { copyFrom: source.id, copyTo: s.course.id }).expect(403)
    await copyAll(s.users.outsider, { copyFrom: source.id, copyTo: s.course.id }).expect(403)
    await anonymous().post('/api/checklist/copyall').send({ copyFrom: source.id, copyTo: s.course.id }).expect(401)
    assert.strictEqual((await checklistsOf(s.course)).length, 0)
  })

  it('rejects bad input, unknown and invalid courses', async () => {
    await copyAll(s.users.teacher, { copyFrom: String(source.id), copyTo: s.course.id }).expect(400)
    await copyAll(s.users.teacher, { copyFrom: s.course.id, copyTo: s.course.id }).expect(400)
    await copyAll(s.users.teacher, { copyFrom: 999999, copyTo: s.course.id }).expect(404)
    await source.update({ invalid: true })
    await copyAll(s.users.teacher, { copyFrom: source.id, copyTo: s.course.id }).expect(404)
  })
})
