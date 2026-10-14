const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { Checklist, ChecklistItem } = require('../server/models')

const itemsOf = async checklistId => ChecklistItem.findAll({ where: { checklistId }, order: [['order', 'ASC']] })

describe('Checklists API', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
  })

  describe('POST /api/checklist/create', () => {
    const weekChecklist = () => ({
      courseInstanceId: s.course.id,
      week: 1,
      maxPoints: 3,
      checklist: {
        Code: [
          {
            tempId: 't1',
            name: 'Has tests',
            checkedPoints: 1,
            uncheckedPoints: 0,
            textWhenOn: 'Tests ok',
            textWhenOff: 'Add tests'
          },
          { name: 'Tests pass', checkedPoints: 1, uncheckedPoints: 0, prerequisite: 't1' }
        ],
        Documentation: [
          {
            name: 'README',
            checkedPoints: 0.5,
            uncheckedPoints: -0.5,
            minimumRequirement: true,
            minimumRequirementMetIf: true,
            minimumRequirementGradePenalty: 2
          }
        ]
      }
    })

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/checklist/create')
        .send(weekChecklist())
        .expect(401)
    })

    it('lets a teacher create a week checklist', async () => {
      const res = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(weekChecklist())
        .expect(200)

      assert.strictEqual(res.body.message, 'Checklist saved successfully for week 1.')
      assert.strictEqual(res.body.result.week, 1)
      assert.strictEqual(res.body.result.maxPoints, 3)
      assert.deepStrictEqual(Object.keys(res.body.result.list).sort(), ['Code', 'Documentation'])
      assert.deepStrictEqual(
        res.body.result.list.Code.map(i => i.name),
        ['Has tests', 'Tests pass']
      )

      const checklists = await Checklist.findAll({ where: { courseInstanceId: s.course.id } })
      assert.strictEqual(checklists.length, 1)
      assert.strictEqual(checklists[0].forCodeReview, false)
      assert.strictEqual(checklists[0].maxPoints, 3)

      const items = await itemsOf(checklists[0].id)
      assert.deepStrictEqual(
        items.map(i => [i.order, i.category, i.name]),
        [
          [1, 'Code', 'Has tests'],
          [2, 'Code', 'Tests pass'],
          [3, 'Documentation', 'README']
        ]
      )
      assert.strictEqual(items[0].textWhenOn, 'Tests ok')
      assert.strictEqual(items[0].textWhenOff, 'Add tests')
      assert.strictEqual(items[1].prerequisite, items[0].id) // temp id mapped to the real id
      assert.strictEqual(items[2].uncheckedPoints, -0.5)
      assert.strictEqual(items[2].minimumRequirement, true)
      assert.strictEqual(items[2].minimumRequirementGradePenalty, 2)
    })

    it('updates an existing checklist: keeps, edits and removes items', async () => {
      const first = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(weekChecklist())
        .expect(200)
      const [hasTests] = first.body.result.list.Code

      await as(s.users.assistant)
        .post('/api/checklist/create')
        .send({
          courseInstanceId: s.course.id,
          week: 1,
          maxPoints: 4,
          checklist: {
            Code: [
              { id: hasTests.id, name: 'Has unit tests', checkedPoints: 2, uncheckedPoints: 0 },
              { name: 'Brand new', checkedPoints: 1, uncheckedPoints: 0 }
            ]
          }
        })
        .expect(200)

      const checklists = await Checklist.findAll({ where: { courseInstanceId: s.course.id } })
      assert.strictEqual(checklists.length, 1)
      assert.strictEqual(checklists[0].maxPoints, 4)
      const items = await itemsOf(checklists[0].id)
      assert.deepStrictEqual(
        items.map(i => i.name),
        ['Has unit tests', 'Brand new']
      )
      assert.strictEqual(items[0].id, hasTests.id)
      assert.strictEqual(items[0].checkedPoints, 2)
    })

    it('creates a code review checklist', async () => {
      const res = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send({
          courseInstanceId: s.course.id,
          forCodeReview: true,
          maxPoints: 2,
          checklist: { Review: [{ name: 'Constructive', checkedPoints: 2, uncheckedPoints: 0 }] }
        })
        .expect(200)
      assert.strictEqual(res.body.message, 'Checklist saved successfully for code review.')
      const [checklist] = await Checklist.findAll({ where: { courseInstanceId: s.course.id } })
      assert.strictEqual(checklist.forCodeReview, true)
      assert.deepStrictEqual(
        (await itemsOf(checklist.id)).map(i => i.name),
        ['Constructive']
      )
    })

    it('names the final review in the message', async () => {
      await s.course.update({ finalReview: true, weekAmount: 7 })
      const res = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send({ ...weekChecklist(), week: 8 })
        .expect(200)
      assert.strictEqual(res.body.message, 'Checklist saved successfully for final review.')
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/checklist/create')
        .send(weekChecklist())
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/checklist/create')
        .send(weekChecklist())
        .expect(403)
      assert.strictEqual(await Checklist.count(), 0)
      assert.strictEqual(await ChecklistItem.count(), 0)
    })

    it('rejects malformed input', async () => {
      const noWeek = weekChecklist()
      delete noWeek.week
      await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(noWeek)
        .expect(400)
      await as(s.users.teacher)
        .post('/api/checklist/create')
        .send({ ...weekChecklist(), maxPoints: -1 })
        .expect(400)
      assert.strictEqual(await Checklist.count(), 0)
    })

    it('creates a new item for an item id that does not exist', async () => {
      const body = weekChecklist()
      body.checklist.Code[1].id = 999999
      const res = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(body)
        .expect(200)
      const names = res.body.result.list.Code.map(item => item.name)
      assert.deepStrictEqual(names, ['Has tests', 'Tests pass'])
      assert.ok(res.body.result.list.Code.every(item => item.id !== 999999))
      assert.strictEqual(await ChecklistItem.count(), 3)
    })

    it('answers the validation error as the message', async () => {
      const body = weekChecklist()
      body.checklist.Code[0].unexpected = 'x'
      const res = await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(body)
        .expect(400)
      assert.strictEqual(res.body.message, 'Found unexpected key: unexpected')
    })

    it('rejects checklist rows with unexpected keys without saving anything', async () => {
      const body = weekChecklist()
      body.checklist.Code[0].unexpected = 'x'
      await as(s.users.teacher)
        .post('/api/checklist/create')
        .send(body)
        .expect(400)
      await new Promise(resolve => setTimeout(resolve, 500)) // the handler keeps running after the 400
      assert.strictEqual(await ChecklistItem.count(), 0)
    })
  })

  describe('check descriptions (#525)', () => {
    const checklistWithDescriptions = (...descriptions) => ({
      courseInstanceId: s.course.id,
      week: 1,
      maxPoints: 3,
      checklist: {
        Code: descriptions.map((description, index) => ({
          name: `Check ${index + 1}`,
          checkedPoints: 1,
          uncheckedPoints: 0,
          ...(description === undefined ? {} : { description })
        }))
      }
    })
    const savedDescriptions = async () => (await ChecklistItem.findAll({ order: [['order', 'ASC']] }))
      .map(item => item.description)

    it('saves the description of each check and returns it with the checklist', async () => {
      await as(s.users.teacher).post('/api/checklist/create')
        .send(checklistWithDescriptions('  Tests cover the core logic  ', '', null, undefined))
        .expect(200)
      assert.deepStrictEqual(await savedDescriptions(), ['Tests cover the core logic', null, null, null])

      const res = await as(s.users.teacher).post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 1 })
        .expect(200)
      assert.strictEqual(res.body.list.Code[0].description, 'Tests cover the core logic')

      const details = await as(s.users.teacher).get(`/api/courses/${s.course.ohid}`).expect(200)
      assert.strictEqual(details.body.checklists.find(c => c.week === 1).list.Code[0].description,
        'Tests cover the core logic')
    })

    it('updates and clears a description when the checklist is saved again', async () => {
      await as(s.users.teacher).post('/api/checklist/create')
        .send(checklistWithDescriptions('First', 'Second'))
        .expect(200)
      const res = await as(s.users.teacher).post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 1 })
        .expect(200)
      const [first, second] = res.body.list.Code
        .map(({ id, name, checkedPoints, uncheckedPoints }) => ({ id, name, checkedPoints, uncheckedPoints }))
      await as(s.users.teacher).post('/api/checklist/create')
        .send({ ...checklistWithDescriptions(), checklist: { Code: [{ ...first, description: 'Changed' }, { ...second, description: '' }] } })
        .expect(200)
      assert.deepStrictEqual(await savedDescriptions(), ['Changed', null])
    })

    it('rejects descriptions that are not texts', async () => {
      await as(s.users.teacher).post('/api/checklist/create')
        .send(checklistWithDescriptions(42))
        .expect(400)
    })
  })

  describe('POST /api/checklist/getone', () => {
    let items

    beforeEach(async () => {
      const checklist = await f.createChecklist(s.course, {
        week: 2,
        maxPoints: 5,
        items: {
          B: [{ name: 'Second', checkedPoints: 1, uncheckedPoints: 0 }],
          A: [{ name: 'First', checkedPoints: 1, uncheckedPoints: 0 }]
        }
      })
      items = checklist.items // eslint-disable-line prefer-destructuring
      await f.createChecklist(s.course, {
        forCodeReview: true,
        items: { Review: [{ name: 'Review item', checkedPoints: 1, uncheckedPoints: 0 }] }
      })
    })

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2 })
        .expect(401)
    })

    it('returns the week checklist grouped by category for a teacher', async () => {
      const res = await as(s.users.teacher)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2 })
        .expect(200)
      assert.strictEqual(res.body.week, 2)
      assert.strictEqual(res.body.maxPoints, 5)
      assert.deepStrictEqual(Object.keys(res.body.list), ['B', 'A']) // follows item order
      assert.strictEqual(res.body.list.B[0].id, items[0].id)
      assert.strictEqual(res.body.list.B[0].name, 'Second')
      assert.ok(!('category' in res.body.list.B[0]))
    })

    it('returns the checklist to a student of the course', async () => {
      const res = await as(s.users.student)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2 })
        .expect(200)
      assert.strictEqual(res.body.list.A[0].name, 'First')
    })

    it('returns the code review checklist', async () => {
      const res = await as(s.users.assistant)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, forCodeReview: true })
        .expect(200)
      assert.strictEqual(res.body.forCodeReview, true)
      assert.deepStrictEqual(
        res.body.list.Review.map(i => i.name),
        ['Review item']
      )
    })

    it('replaces ids with temp ids when copying', async () => {
      const res = await as(s.users.teacher)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2, copying: true })
        .expect(200)
      assert.strictEqual(res.body.list.B[0].tempId, items[0].id)
      assert.ok(!('id' in res.body.list.B[0]))
    })

    it('is forbidden for users outside the course', async () => {
      await as(s.users.outsider)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2 })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 2 })
        .expect(403)
    })

    it('answers 400 for a missing checklist or malformed input', async () => {
      const res = await as(s.users.teacher)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: s.course.id, week: 6 })
        .expect(400)
      assert.strictEqual(res.body.message, 'No matching checklist found.')
      await as(s.users.teacher)
        .post('/api/checklist/getone')
        .send({ courseInstanceId: String(s.course.id), week: 2 })
        .expect(400)
    })
  })

  describe('GET /api/checklist/copyable', () => {
    const item = { Code: [{ name: 'Has tests', checkedPoints: 1, uncheckedPoints: 0 }] }
    const sorted = list => list.slice().sort((a, b) => (a.courseInstanceId - b.courseInstanceId) || ((a.week || 0) - (b.week || 0)))

    it('requires authentication', async () => {
      await anonymous()
        .get('/api/checklist/copyable')
        .expect(401)
    })

    it('lists non-empty checklists on the courses the user teaches', async () => {
      const secondCourse = await f.createCourse()
      await f.addTeacher(s.users.teacher, secondCourse)
      await f.createChecklist(s.course, { week: 1, items: item })
      await f.createChecklist(s.course, { forCodeReview: true, items: item })
      await f.createChecklist(secondCourse, { week: 2, items: item })

      const res = await as(s.users.teacher)
        .get('/api/checklist/copyable')
        .expect(200)
      assert.deepStrictEqual(sorted(res.body), sorted([
        { courseInstanceId: s.course.id, week: 1, forCodeReview: false },
        { courseInstanceId: s.course.id, week: null, forCodeReview: true },
        { courseInstanceId: secondCourse.id, week: 2, forCodeReview: false }
      ]))
    })

    it('leaves out empty checklists', async () => {
      await f.createChecklist(s.course, { week: 1 })
      const res = await as(s.users.teacher)
        .get('/api/checklist/copyable')
        .expect(200)
      assert.deepStrictEqual(res.body, [])
    })

    it('leaves out checklists on courses the user is not on', async () => {
      await f.createChecklist(s.otherCourse, { week: 1, items: item })
      await f.createChecklist(s.course, { week: 3, items: item })

      const asTeacher = await as(s.users.teacher).get('/api/checklist/copyable').expect(200)
      assert.deepStrictEqual(asTeacher.body, [{ courseInstanceId: s.course.id, week: 3, forCodeReview: false }])

      const asOutsider = await as(s.users.outsider).get('/api/checklist/copyable').expect(200)
      assert.deepStrictEqual(asOutsider.body, [])
    })

    it('includes courses the user is a student on, like getone does', async () => {
      await f.createChecklist(s.course, { week: 1, items: item })
      const res = await as(s.users.student)
        .get('/api/checklist/copyable')
        .expect(200)
      assert.deepStrictEqual(res.body, [{ courseInstanceId: s.course.id, week: 1, forCodeReview: false }])
    })
  })
})
