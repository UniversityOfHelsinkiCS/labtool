const assert = require('assert')
const { api, as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const {
  CourseInstance,
  StudentInstance,
  ReviewCheck,
  WeekDraft,
  StudentTag,
  Tag,
  Checklist,
  ChecklistItem
} = require('../server/models')

describe('Course instances API', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
  })

  describe('GET /api/courseinstances', () => {
    it('lists all courses without timestamps (public)', async () => {
      const res = await api.get('/api/courseinstances').expect(200)
      assert.strictEqual(res.body.length, 2)
      const course = res.body.find(c => c.id === s.course.id)
      assert.strictEqual(course.ohid, s.course.ohid)
      assert.strictEqual(course.name, s.course.name)
      assert.strictEqual(course.weekAmount, 7)
      assert.strictEqual(course.active, true)
      assert.ok(!('createdAt' in course))
    })
  })

  describe('GET /api/courseinstances/:ohid', () => {
    it('requires authentication', async () => {
      await anonymous()
        .get(`/api/courseinstances/${s.course.ohid}`)
        .expect(401)
    })

    it('returns the course', async () => {
      const res = await as(s.users.outsider)
        .get(`/api/courseinstances/${s.course.ohid}`)
        .expect(200)
      assert.strictEqual(res.body.id, s.course.id)
      assert.strictEqual(res.body.name, s.course.name)
      assert.ok(!('updatedAt' in res.body))
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.outsider)
        .get('/api/courseinstances/nope')
        .expect(404)
    })
  })

  describe('GET /api/courses/:ohid (course details)', () => {
    beforeEach(async () => {
      await f.createChecklist(s.course, {
        week: 1,
        items: {
          Code: [{ name: 'Tests', checkedPoints: 1, uncheckedPoints: 0 }],
          Docs: [{ name: 'README', checkedPoints: 0.5, uncheckedPoints: 0 }]
        }
      })
    })

    it('requires authentication', async () => {
      await anonymous()
        .get(`/api/courses/${s.course.ohid}`)
        .expect(401)
    })

    it('gives a teacher the course, its teachers with names and its checklists', async () => {
      const res = await as(s.users.teacher)
        .get(`/api/courses/${s.course.ohid}`)
        .expect(200)

      assert.strictEqual(res.body.id, s.course.id)
      assert.strictEqual(res.body.registrationAtWebOodi, 'found')
      const teachers = res.body.teacherInstances.map(t => `${t.firsts} ${t.lastname}:${t.instructor}`).sort()
      assert.deepStrictEqual(teachers, ['Antti Assistant:true', 'Terhi Teacher:false'])

      assert.strictEqual(res.body.checklists.length, 1)
      const { list } = res.body.checklists[0]
      assert.deepStrictEqual(Object.keys(list).sort(), ['Code', 'Docs'])
      assert.strictEqual(list.Code[0].name, 'Tests')
      assert.strictEqual(list.Code[0].checkedPoints, 1)
      assert.ok(!('category' in list.Code[0]))
    })

    it('returns checklist topics and items in the order set in the editor (#1125, #1130)', async () => {
      // rows stored in the opposite physical order to their `order`, as reordering in the editor leaves them
      const { checklist } = await f.createChecklist(s.course, { week: 2 })
      const item = (name, category, order) => ChecklistItem.create({
        checklistId: checklist.id, name, category, order, checkedPoints: 1, uncheckedPoints: 0, textWhenOn: '', textWhenOff: ''
      })
      await item('last', 'Second topic', 4)
      await item('third', 'Second topic', 3)
      await item('second', 'First topic', 2)
      await item('first', 'First topic', 1)

      const res = await as(s.users.teacher)
        .get(`/api/courses/${s.course.ohid}`)
        .expect(200)
      const { list } = res.body.checklists.find(c => c.week === 2)
      assert.deepStrictEqual(Object.keys(list), ['First topic', 'Second topic'])
      assert.deepStrictEqual(list['First topic'].map(i => i.name), ['first', 'second'])
      assert.deepStrictEqual(list['Second topic'].map(i => i.name), ['third', 'last'])
    })

    it('hides the teacher list from students but shows checklists', async () => {
      const res = await as(s.users.student)
        .get(`/api/courses/${s.course.ohid}`)
        .expect(200)
      assert.deepStrictEqual(res.body.teacherInstances, [])
      assert.strictEqual(res.body.checklists.length, 1)
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.student)
        .get('/api/courses/nope')
        .expect(404)
    })
  })

  describe('POST /api/course/teacher and /api/course/student', () => {
    it('require authentication', async () => {
      await anonymous()
        .post('/api/course/teacher')
        .expect(401)
      await anonymous()
        .post('/api/course/student')
        .expect(401)
    })

    it('lists the courses the user teaches', async () => {
      const res = await as(s.users.assistant)
        .post('/api/course/teacher')
        .expect(200)
      assert.deepStrictEqual(
        res.body.map(c => c.id),
        [s.course.id]
      )
      assert.strictEqual(res.body[0].teachercourseInstances[0].userId, s.users.assistant.id)

      const none = await as(s.users.student)
        .post('/api/course/teacher')
        .expect(200)
      assert.deepStrictEqual(none.body, [])
    })

    it('lists the courses the user studies on', async () => {
      const res = await as(s.users.student)
        .post('/api/course/student')
        .expect(200)
      assert.strictEqual(res.body.length, 1)
      assert.strictEqual(res.body[0].ohid, s.course.ohid)
      assert.strictEqual(res.body[0].github, s.student.github)

      const none = await as(s.users.teacher)
        .post('/api/course/student')
        .expect(200)
      assert.deepStrictEqual(none.body, [])
    })
  })

  describe('POST /api/courseinstances/:id (courses of a student instance)', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post(`/api/courseinstances/${s.student.id}`)
        .expect(401)
    })

    it('lists every course of the student for a teacher of the course', async () => {
      await f.addStudent(s.users.student, s.otherCourse)
      const res = await as(s.users.teacher)
        .post(`/api/courseinstances/${s.student.id}`)
        .expect(200)
      assert.deepStrictEqual(res.body.map(c => c.id).sort(), [s.course.id, s.otherCourse.id].sort())
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post(`/api/courseinstances/${s.student.id}`)
        .expect(403)
      await as(s.users.otherTeacher)
        .post(`/api/courseinstances/${s.student.id}`)
        .expect(403)
    })

    it('returns 400 for an unknown student instance', async () => {
      await as(s.users.teacher)
        .post('/api/courseinstances/999999')
        .expect(400)
    })
  })

  describe('POST /api/courseinstances/coursepage', () => {
    let week
    let checklistItem

    beforeEach(async () => {
      await s.course.update({ currentCodeReview: [1] })
      const checklist = await f.createChecklist(s.course, {
        week: 1,
        items: { Code: [{ name: 'Tests', checkedPoints: 1, uncheckedPoints: 0 }] }
      })
      checklistItem = checklist.items[0] // eslint-disable-line prefer-destructuring
      week = await f.createWeek(s.student, { weekNumber: 1, points: 2.5, feedback: 'Nice', instructorNotes: 'secret' })
      await ReviewCheck.create({ weekId: week.id, checklistItemId: checklistItem.id, checked: true })
      await f.createComment(week, s.users.teacher, { comment: 'visible', hidden: false })
      await f.createComment(week, s.users.teacher, { comment: 'hidden one', hidden: true })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 2 }) // not current, not graded
      await WeekDraft.create({ studentInstanceId: s.student.id, weekNumber: 2, data: { points: 1 } })
      const tag = await f.createTag({ name: 'needs help', courseInstanceId: s.course.id })
      await StudentTag.create({ studentInstanceId: s.student.id, tagId: tag.id })
    })

    it('answers 400 for a course that is not a course code, and keeps running', async () => {
      await as(s.users.teacher)
        .post('/api/courseinstances/coursepage')
        .send({ course: 12345 })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
    })

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(401)
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.student)
        .post('/api/courseinstances/coursepage')
        .send({ course: 'nope' })
        .expect(404)
    })

    it('gives a registered student their own data, without hidden comments or instructor notes', async () => {
      const res = await as(s.users.student)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)

      assert.strictEqual(res.body.role, 'student')
      const { data } = res.body
      assert.strictEqual(data.id, s.student.id)
      assert.strictEqual(data.github, s.student.github)
      assert.strictEqual(data.User.username, 'student')

      assert.strictEqual(data.weeks.length, 1)
      assert.strictEqual(data.weeks[0].points, 2.5)
      assert.strictEqual(data.weeks[0].feedback, 'Nice')
      assert.ok(!('instructorNotes' in data.weeks[0]))
      assert.deepStrictEqual(data.weeks[0].checks, { [checklistItem.id]: true })
      assert.deepStrictEqual(
        data.weeks[0].comments.map(c => c.comment),
        ['visible']
      )

      assert.deepStrictEqual(data.codeReviews, [
        {
          toReview: { github: s.student2.github, projectName: s.student2.projectName },
          reviewNumber: 1,
          points: null,
          linkToReview: null,
          repoToReview: null
        }
      ])
    })

    it('includes graded code reviews from earlier rounds for the student', async () => {
      await s.course.update({ currentCodeReview: [] })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 3, points: 2 })
      const res = await as(s.users.student)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
      assert.deepStrictEqual(
        res.body.data.codeReviews.map(cr => [cr.reviewNumber, cr.points]),
        [[3, 2]]
      )
    })

    it('gives an unregistered user the student role with no data', async () => {
      const res = await as(s.users.outsider)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
      assert.deepStrictEqual(res.body, { role: 'student', data: null })
    })

    it('gives a teacher every student with full review data', async () => {
      const res = await as(s.users.teacher)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)

      assert.strictEqual(res.body.role, 'teacher')
      assert.strictEqual(res.body.data.length, 2)
      const student = res.body.data.find(si => si.id === s.student.id)
      const student2 = res.body.data.find(si => si.id === s.student2.id)

      assert.strictEqual(student.User.username, 'student')
      assert.strictEqual(student.weeks[0].instructorNotes, 'secret')
      assert.deepStrictEqual(student.weeks[0].comments.map(c => c.comment).sort(), ['hidden one', 'visible'])
      assert.deepStrictEqual(student.weeks[0].checks, { [checklistItem.id]: true })
      assert.deepStrictEqual(
        student.codeReviews.map(cr => cr.reviewNumber),
        [1, 2]
      )
      assert.strictEqual(student.codeReviews[0].toReview, s.student2.id)
      assert.deepStrictEqual(student.codeReviews[0].checks, [])
      assert.deepStrictEqual(student.weekdrafts, [{ weekNumber: 2 }])
      assert.deepStrictEqual(
        student.Tags.map(t => t.name),
        ['needs help']
      )

      assert.deepStrictEqual(student2.weeks, [])
      assert.deepStrictEqual(student2.codeReviews, [])
    })

    it('gives an assistant the teacher view too', async () => {
      const res = await as(s.users.assistant)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
      assert.strictEqual(res.body.role, 'teacher')
      assert.strictEqual(res.body.data.length, 2)
    })

    it('does not give a teacher of another course the teacher view', async () => {
      const res = await as(s.users.otherTeacher)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
      assert.deepStrictEqual(res.body, { role: 'student', data: null })
    })
  })

  describe('PUT /api/courseinstances/:ohid', () => {
    const update = {
      name: 'Renamed course',
      active: false,
      weekAmount: 9,
      weekMaxPoints: 5,
      currentWeek: 3,
      finalReview: true,
      newCr: [1, 2],
      coursesPage: 'https://courses.example/page',
      courseMaterial: 'https://material.example',
      finalReviewHasPoints: false
    }

    it('requires authentication', async () => {
      await anonymous()
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send(update)
        .expect(401)
    })

    it('accepts only http(s) links as course page and material links', async () => {
      for (const field of ['coursesPage', 'courseMaterial']) {
        for (const link of ['javascript:alert(1)', 'data:text/html,x', 'courses.example/page']) {
          const res = await as(s.users.assistant)
            .put(`/api/courseinstances/${s.course.ohid}`)
            .send({ ...update, [field]: link })
            .expect(400)
          assert.match(res.body.message, /http/)
        }
      }
      const course = await CourseInstance.findByPk(s.course.id)
      assert.notStrictEqual(course.name, 'Renamed course')

      await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ ...update, courseMaterial: '' })
        .expect(200)
    })

    it('lets a teacher of the course update it', async () => {
      const res = await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send(update)
        .expect(200)

      assert.strictEqual(res.body.name, 'Renamed course')
      const course = await CourseInstance.findByPk(s.course.id)
      assert.strictEqual(course.name, 'Renamed course')
      assert.strictEqual(course.active, false)
      assert.strictEqual(course.weekAmount, 9)
      assert.strictEqual(course.weekMaxPoints, 5)
      assert.strictEqual(course.currentWeek, 3)
      assert.strictEqual(course.finalReview, true)
      assert.deepStrictEqual(course.currentCodeReview, [1, 2])
      assert.strictEqual(course.coursesPage, 'https://courses.example/page')
      assert.strictEqual(course.courseMaterial, 'https://material.example')
      assert.strictEqual(course.finalReviewHasPoints, false)
    })

    it('lets an assistant update it', async () => {
      await as(s.users.assistant)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ ...update, active: true })
        .expect(200)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).name, 'Renamed course')
    })

    it('is rejected for students and teachers of other courses', async () => {
      await as(s.users.student)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send(update)
        .expect(400)
      await as(s.users.otherTeacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send(update)
        .expect(400)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).name, s.course.name)
    })

    it('validates week settings', async () => {
      await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ ...update, weekAmount: 0 })
        .expect(400)
      await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ ...update, weekAmount: 31 })
        .expect(400)
      await as(s.users.teacher)
        .put(`/api/courseinstances/${s.course.ohid}`)
        .send({ ...update, weekMaxPoints: -1 })
        .expect(400)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).weekAmount, 7)
    })

    it('returns 400 for an unknown course', async () => {
      await as(s.users.teacher)
        .put('/api/courseinstances/nope')
        .send(update)
        .expect(400)
    })
  })

  describe('POST /api/course/register/:ohid', () => {
    const registration = { github: 'https://github.com/newbie/project', projectName: 'Newbie project' }

    it('requires authentication', async () => {
      await anonymous()
        .post(`/api/course/register/${s.course.ohid}`)
        .send(registration)
        .expect(401)
    })

    it('registers the user as a student on the course', async () => {
      const res = await as(s.users.outsider)
        .post(`/api/course/register/${s.course.ohid}`)
        .send(registration)
        .expect(200)

      const [instance, created] = res.body
      assert.strictEqual(created, true)
      assert.strictEqual(instance.userId, s.users.outsider.id)
      assert.strictEqual(instance.courseInstanceId, s.course.id)

      const si = await StudentInstance.findOne({
        where: { userId: s.users.outsider.id, courseInstanceId: s.course.id }
      })
      assert.strictEqual(si.github, 'https://github.com/newbie/project')
      assert.strictEqual(si.projectName, 'Newbie project')
      assert.strictEqual(si.validRegistration, true)
      assert.strictEqual(si.dropped, false)
    })

    it('does not create a second registration for an already registered student', async () => {
      const res = await as(s.users.student)
        .post(`/api/course/register/${s.course.ohid}`)
        .send(registration)
        .expect(200)
      assert.strictEqual(res.body[1], false)
      const instances = await StudentInstance.findAll({ where: { userId: s.users.student.id } })
      assert.strictEqual(instances.length, 1)
      assert.strictEqual(instances[0].github, s.student.github)
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.outsider)
        .post('/api/course/register/nope')
        .send(registration)
        .expect(404)
    })

    it('refuses registration to an inactive course', async () => {
      await s.course.update({ active: false })
      const res = await as(s.users.outsider)
        .post(`/api/course/register/${s.course.ohid}`)
        .send(registration)
        .expect(400)
      assert.deepStrictEqual(res.body, { message: 'Course is not active.' })
      assert.strictEqual(await StudentInstance.count({ where: { userId: s.users.outsider.id } }), 0)
    })

    it('rejects an invalid project name', async () => {
      const res = await as(s.users.outsider)
        .post(`/api/course/register/${s.course.ohid}`)
        .send({ ...registration, projectName: 'Bad <script>' })
        .expect(400)
      assert.ok(res.body.message.startsWith('Project name contains illegal characters.'))
      assert.strictEqual(await StudentInstance.count({ where: { userId: s.users.outsider.id } }), 0)
    })

    it('rejects an invalid GitHub link', async () => {
      const res = await as(s.users.outsider)
        .post(`/api/course/register/${s.course.ohid}`)
        .send({ ...registration, github: 'not a url' })
        .expect(400)
      assert.ok(res.body.message.includes('GitHub link'))
      assert.strictEqual(await StudentInstance.count({ where: { userId: s.users.outsider.id } }), 0)
    })
  })

  describe('POST /api/courseinstances/copy', () => {
    let template

    beforeEach(async () => {
      template = await f.createCourse({ weekAmount: 12, weekMaxPoints: 4.5, finalReview: true })
      await f.createTag({ name: 'template tag', color: 'blue', courseInstanceId: template.id })
      await f.createTag({ name: 'clash', color: 'blue', courseInstanceId: template.id })
      await f.createTag({ name: 'clash', color: 'green', courseInstanceId: s.course.id })
      const { items } = await f.createChecklist(template, {
        week: 2,
        maxPoints: 4,
        items: {
          Basics: [
            { name: 'Base', checkedPoints: 1, uncheckedPoints: 0 },
            { name: 'Advanced', checkedPoints: 2, uncheckedPoints: 0 }
          ]
        }
      })
      await items[1].update({ prerequisite: items[0].id })
      await f.createChecklist(template, {
        forCodeReview: true,
        items: { Review: [{ name: 'Helpful', checkedPoints: 1, uncheckedPoints: 0 }] }
      })
    })

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/courseinstances/copy')
        .send({ copyFrom: template.id, copyTo: s.course.id })
        .expect(401)
    })

    it('copies settings, tags and checklists to the teacher\'s course', async () => {
      const res = await as(s.users.teacher)
        .post('/api/courseinstances/copy')
        .send({ copyFrom: template.id, copyTo: s.course.id })
        .expect(200)
      assert.strictEqual(res.body.id, s.course.id)

      const course = await CourseInstance.findByPk(s.course.id)
      assert.strictEqual(course.weekAmount, 12)
      assert.strictEqual(course.weekMaxPoints, 4.5)
      assert.strictEqual(course.finalReview, true)

      const tags = await Tag.findAll({ where: { courseInstanceId: s.course.id } })
      assert.deepStrictEqual(tags.map(t => `${t.name}:${t.color}`).sort(), ['clash:green', 'template tag:blue'])

      const checklists = await Checklist.findAll({ where: { courseInstanceId: s.course.id } })
      assert.strictEqual(checklists.length, 2)
      const weekChecklist = checklists.find(cl => !cl.forCodeReview)
      assert.strictEqual(weekChecklist.week, 2)
      assert.strictEqual(weekChecklist.maxPoints, 4)
      const items = await ChecklistItem.findAll({ where: { checklistId: weekChecklist.id } })
      const base = items.find(i => i.name === 'Base')
      const advanced = items.find(i => i.name === 'Advanced')
      assert.strictEqual(advanced.prerequisite, base.id)
      assert.strictEqual(base.prerequisite, null)

      // the template is untouched
      assert.strictEqual(await Checklist.count({ where: { courseInstanceId: template.id } }), 2)
    })

    it('does not replace an existing checklist for the same week', async () => {
      await f.createChecklist(s.course, {
        week: 2,
        items: { Mine: [{ name: 'Own item', checkedPoints: 1, uncheckedPoints: 0 }] }
      })
      await as(s.users.teacher)
        .post('/api/courseinstances/copy')
        .send({ copyFrom: template.id, copyTo: s.course.id })
        .expect(200)

      const weekChecklists = await Checklist.findAll({ where: { courseInstanceId: s.course.id, week: 2 } })
      assert.strictEqual(weekChecklists.length, 1)
      const items = await ChecklistItem.findAll({ where: { checklistId: weekChecklists[0].id } })
      assert.deepStrictEqual(
        items.map(i => i.name),
        ['Own item']
      )
    })

    it('is forbidden unless the user teaches the target course', async () => {
      await as(s.users.student)
        .post('/api/courseinstances/copy')
        .send({ copyFrom: template.id, copyTo: s.course.id })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/courseinstances/copy')
        .send({ copyFrom: template.id, copyTo: s.course.id })
        .expect(403)
      assert.strictEqual((await CourseInstance.findByPk(s.course.id)).weekAmount, 7)
      assert.strictEqual(await Checklist.count({ where: { courseInstanceId: s.course.id } }), 0)
    })

    it('validates input', async () => {
      await as(s.users.teacher)
        .post('/api/courseinstances/copy')
        .send({ copyTo: s.course.id })
        .expect(400)
      await as(s.users.teacher)
        .post('/api/courseinstances/copy')
        .send({ copyFrom: 999999, copyTo: s.course.id })
        .expect(400)
    })
  })

  describe('POST /api/studentinstance/update', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, github: 'https://github.com/x/y' })
        .expect(401)
    })

    it('lets a student update their own repository and project name', async () => {
      const res = await as(s.users.student)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, github: 'https://github.com/student/new-repo', projectName: 'New name' })
        .expect(200)
      assert.strictEqual(res.body.github, 'https://github.com/student/new-repo')

      const si = await StudentInstance.findByPk(s.student.id)
      assert.strictEqual(si.github, 'https://github.com/student/new-repo')
      assert.strictEqual(si.projectName, 'New name')
    })

    it('does not let a student disable issues', async () => {
      await as(s.users.student)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, issuesDisabled: true })
        .expect(403)
      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).issuesDisabled, null)
    })

    it('lets a teacher update a student\'s flags', async () => {
      await as(s.users.teacher)
        .post('/api/studentinstance/update')
        .send({
          ohid: s.course.ohid,
          userId: s.users.student.id,
          dropped: true,
          validRegistration: false,
          issuesDisabled: true,
          repoExists: false
        })
        .expect(200)

      const si = await StudentInstance.findByPk(s.student.id)
      assert.strictEqual(si.dropped, true)
      assert.strictEqual(si.validRegistration, false)
      assert.strictEqual(si.issuesDisabled, true)
      assert.strictEqual(si.repoExists, false)
      assert.ok(si.issuesDisabledCheckedAt instanceof Date)
      // other students untouched
      assert.strictEqual((await StudentInstance.findByPk(s.student2.id)).dropped, false)
    })

    it('lets any assistant of the course update a student', async () => {
      await as(s.users.assistant)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, userId: s.users.student.id, dropped: true })
        .expect(200)
      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).dropped, true)
    })

    it('is forbidden for other students and teachers of other courses', async () => {
      await as(s.users.student2)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, userId: s.users.student.id, dropped: true })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, userId: s.users.student.id, dropped: true })
        .expect(403)
      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).dropped, false)
    })

    it('rejects an invalid project name', async () => {
      const res = await as(s.users.student)
        .post('/api/studentinstance/update')
        .send({ ohid: s.course.ohid, projectName: 'Bad <name>' })
        .expect(400)
      assert.ok(res.body.message.startsWith('Project name contains illegal characters.'))
      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).projectName, s.student.projectName)
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.student)
        .post('/api/studentinstance/update')
        .send({ ohid: 'nope', dropped: true })
        .expect(404)
    })
  })

  describe('POST /api/studentinstance/massupdate', () => {
    it('requires authentication', async () => {
      await anonymous()
        .post('/api/studentinstance/massupdate')
        .send({ ohid: s.course.ohid, studentInstances: [] })
        .expect(401)
    })

    it('lets a teacher update several students at once', async () => {
      const res = await as(s.users.teacher)
        .post('/api/studentinstance/massupdate')
        .send({
          ohid: s.course.ohid,
          studentInstances: [
            { userId: s.users.student.id, dropped: true, issuesDisabled: true },
            { userId: s.users.student2.id, repoExists: true, projectName: 'Renamed by teacher' }
          ]
        })
        .expect(200)

      assert.deepStrictEqual(res.body.map(si => si.id).sort(), [s.student.id, s.student2.id].sort())
      const si1 = await StudentInstance.findByPk(s.student.id)
      const si2 = await StudentInstance.findByPk(s.student2.id)
      assert.strictEqual(si1.dropped, true)
      assert.strictEqual(si1.issuesDisabled, true)
      assert.ok(si1.issuesDisabledCheckedAt instanceof Date)
      assert.strictEqual(si2.repoExists, true)
      assert.strictEqual(si2.projectName, 'Renamed by teacher')
      assert.strictEqual(si2.dropped, false)
    })

    it('lets a teacher change a student\'s GitHub repository', async () => {
      await as(s.users.teacher)
        .post('/api/studentinstance/massupdate')
        .send({
          ohid: s.course.ohid,
          studentInstances: [{ userId: s.users.student.id, github: 'https://github.com/x/moved' }]
        })
        .expect(200)
      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).github, 'https://github.com/x/moved')
    })

    it('silently ignores students the caller may not update', async () => {
      const asStudent = await as(s.users.student)
        .post('/api/studentinstance/massupdate')
        .send({
          ohid: s.course.ohid,
          studentInstances: [
            { userId: s.users.student.id, dropped: true },
            { userId: s.users.student2.id, dropped: true }
          ]
        })
        .expect(200)
      assert.deepStrictEqual(asStudent.body, [])

      const asOtherTeacher = await as(s.users.otherTeacher)
        .post('/api/studentinstance/massupdate')
        .send({ ohid: s.course.ohid, studentInstances: [{ userId: s.users.student.id, dropped: true }] })
        .expect(200)
      assert.deepStrictEqual(asOtherTeacher.body, [])

      assert.strictEqual((await StudentInstance.findByPk(s.student.id)).dropped, false)
      assert.strictEqual((await StudentInstance.findByPk(s.student2.id)).dropped, false)
    })

    it('returns 404 for an unknown course', async () => {
      await as(s.users.teacher)
        .post('/api/studentinstance/massupdate')
        .send({ ohid: 'nope', studentInstances: [] })
        .expect(404)
    })
  })

  describe('comments', () => {
    let week

    beforeEach(async () => {
      week = await f.createWeek(s.student)
    })

    describe('POST /api/comment', () => {
      it('requires authentication', async () => {
        await anonymous()
          .post('/api/comment')
          .send({ week: week.id, comment: 'hi', hidden: false })
          .expect(401)
      })

      it('lets the student comment on their own week review', async () => {
        const res = await as(s.users.student)
          .post('/api/comment')
          .send({ week: week.id, comment: 'Thanks!', hidden: false })
          .expect(200)

        assert.strictEqual(res.body.comment, 'Thanks!')
        assert.strictEqual(res.body.from, 'Sanna Student')
        assert.strictEqual(res.body.weekId, week.id)
        assert.deepStrictEqual(res.body.isRead, [s.users.student.id])

        const comments = await week.getComments()
        assert.strictEqual(comments.length, 1)
        assert.strictEqual(comments[0].userId, s.users.student.id)
        assert.strictEqual(comments[0].notified, false)
      })

      it('lets a teacher add a hidden comment', async () => {
        await as(s.users.assistant)
          .post('/api/comment')
          .send({ week: week.id, comment: 'Instructors only', hidden: true })
          .expect(200)
        const [comment] = await week.getComments()
        assert.strictEqual(comment.hidden, true)
        assert.strictEqual(comment.from, 'Antti Assistant')
      })

      it('is forbidden for other students and teachers of other courses', async () => {
        await as(s.users.student2)
          .post('/api/comment')
          .send({ week: week.id, comment: 'Sneaky', hidden: false })
          .expect(403)
        await as(s.users.otherTeacher)
          .post('/api/comment')
          .send({ week: week.id, comment: 'Sneaky', hidden: false })
          .expect(403)
        assert.strictEqual((await week.getComments()).length, 0)
      })

      it('rejects an empty comment', async () => {
        await as(s.users.student)
          .post('/api/comment')
          .send({ week: week.id, comment: '   ', hidden: false })
          .expect(400)
        assert.strictEqual((await week.getComments()).length, 0)
      })

      it('is forbidden for an unknown week', async () => {
        await as(s.users.teacher)
          .post('/api/comment')
          .send({ week: 999999, comment: 'Hi', hidden: false })
          .expect(403)
      })
    })

    describe('POST /api/comments', () => {
      beforeEach(async () => {
        await f.createComment(week, s.users.teacher, { comment: 'public', hidden: false })
        await f.createComment(week, s.users.teacher, { comment: 'secret', hidden: true })
      })

      it('requires authentication', async () => {
        await anonymous()
          .post('/api/comments')
          .send({ week: week.id })
          .expect(401)
      })

      it('lists all comments of the week for a teacher', async () => {
        const res = await as(s.users.teacher)
          .post('/api/comments')
          .send({ week: week.id })
          .expect(200)
        assert.deepStrictEqual(res.body.map(c => c.comment).sort(), ['public', 'secret'])
      })

      it('lists comments for the student whose week it is', async () => {
        const res = await as(s.users.student)
          .post('/api/comments')
          .send({ week: week.id })
          .expect(200)
        assert.ok(res.body.map(c => c.comment).includes('public'))
      })

      it('does not show hidden comments to the student', async () => {
        const res = await as(s.users.student)
          .post('/api/comments')
          .send({ week: week.id })
          .expect(200)
        assert.deepStrictEqual(
          res.body.map(c => c.comment),
          ['public']
        )
      })

      it('is forbidden for other students and teachers of other courses', async () => {
        await as(s.users.student2)
          .post('/api/comments')
          .send({ week: week.id })
          .expect(403)
        await as(s.users.otherTeacher)
          .post('/api/comments')
          .send({ week: week.id })
          .expect(403)
      })
    })

    describe('PUT /api/comments/update (mark as read)', () => {
      let comment

      beforeEach(async () => {
        comment = await f.createComment(week, s.users.teacher, { comment: 'Read me', isRead: [s.users.teacher.id] })
      })

      it('requires authentication', async () => {
        await anonymous()
          .put('/api/comments/update')
          .send([comment.toJSON()])
          .expect(401)
      })

      it('marks comments as read by the student', async () => {
        const res = await as(s.users.student)
          .put('/api/comments/update')
          .send([{ id: comment.id, weekId: week.id, isRead: [s.users.teacher.id] }])
          .expect(200)
        assert.deepStrictEqual(res.body[0].isRead, [s.users.teacher.id, s.users.student.id])

        await comment.reload()
        assert.deepStrictEqual(comment.isRead, [s.users.teacher.id, s.users.student.id])
      })

      it('handles comments that nobody has read yet', async () => {
        await as(s.users.assistant)
          .put('/api/comments/update')
          .send([{ id: comment.id, weekId: week.id, isRead: null }])
          .expect(200)
        await comment.reload()
        assert.deepStrictEqual(comment.isRead, [s.users.assistant.id])
      })

      it('is forbidden for other students', async () => {
        await as(s.users.student2)
          .put('/api/comments/update')
          .send([{ id: comment.id, weekId: week.id, isRead: [s.users.teacher.id] }])
          .expect(403)
        await comment.reload()
        assert.deepStrictEqual(comment.isRead, [s.users.teacher.id])
      })

      it('rejects comments from different weeks and unknown comments', async () => {
        const otherWeek = await f.createWeek(s.student, { weekNumber: 2 })
        const other = await f.createComment(otherWeek, s.users.teacher)
        await as(s.users.student)
          .put('/api/comments/update')
          .send([
            { id: comment.id, weekId: week.id, isRead: [] },
            { id: other.id, weekId: otherWeek.id, isRead: [] }
          ])
          .expect(400)
        await as(s.users.student)
          .put('/api/comments/update')
          .send([{ id: 999999, weekId: week.id, isRead: [] }])
          .expect(400)
      })
    })
  })

  it('registration does not cause an unhandled promise rejection', async () => {
    const rejections = []
    const listener = reason => rejections.push(reason)
    process.on('unhandledRejection', listener)
    try {
      await as(s.users.outsider)
        .post(`/api/course/register/${s.course.ohid}`)
        .send({ github: 'https://github.com/o/p', projectName: 'P' })
        .expect(200)
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      process.removeListener('unhandledRejection', listener)
    }
    assert.deepStrictEqual(rejections, [])
  })
})
