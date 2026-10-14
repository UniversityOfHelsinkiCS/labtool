const assert = require('assert')
const { as, anonymous } = require('./helpers/api')
const f = require('./helpers/factories')
const { eventually } = require('./helpers/db')
const { CodeReview, CourseInstance, ReviewCheck } = require('../server/models')

const reviewsOf = async studentInstance => (
  await CodeReview.findAll({
    where: { studentInstanceId: studentInstance.id },
    order: [['reviewNumber', 'ASC']]
  })
).map(cr => cr.get({ plain: true }))

describe('Code reviews API', () => {
  let s

  beforeEach(async () => {
    s = await f.createScenario()
  })

  describe('PUT /api/codereviews/bulkinsert', () => {
    const assignment = () => ({
      reviewNumber: 1,
      courseId: s.course.id,
      codeReviews: [
        { reviewer: s.student.id, toReview: s.student2.id },
        { reviewer: s.student2.id, toReview: s.student.id }
      ]
    })

    it('requires authentication', async () => {
      await anonymous()
        .put('/api/codereviews/bulkinsert')
        .send(assignment())
        .expect(401)
    })

    it('lets a teacher assign a code review round', async () => {
      const res = await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send(assignment())
        .expect(201)
      assert.strictEqual(res.body.message, 'All code reviews inserted.')

      const reviews1 = await reviewsOf(s.student)
      assert.strictEqual(reviews1.length, 1)
      assert.strictEqual(reviews1[0].toReview, s.student2.id)
      assert.strictEqual(reviews1[0].reviewNumber, 1)
      assert.strictEqual(reviews1[0].points, null)
      const reviews2 = await reviewsOf(s.student2)
      assert.strictEqual(reviews2[0].toReview, s.student.id)
    })

    it('supports reviewing an external repository', async () => {
      await as(s.users.assistant)
        .put('/api/codereviews/bulkinsert')
        .send({
          reviewNumber: 2,
          courseId: s.course.id,
          codeReviews: [{ reviewer: s.student.id, toReview: null, repoToReview: 'https://github.com/someone/else' }]
        })
        .expect(201)
      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.toReview, null)
      assert.strictEqual(review.repoToReview, 'https://github.com/someone/else')
      assert.strictEqual(review.reviewNumber, 2)
    })

    it('increments the number of code reviews of the course when creating a new round', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ ...assignment(), createTrue: true })
        .expect(201)
      await eventually(async () => {
        assert.strictEqual((await CourseInstance.findByPk(s.course.id)).amountOfCodeReviews, 1)
      })
    })

    it('replaces an earlier assignment of the same round', async () => {
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 2 })
      const third = await f.addStudent(await f.createUser(), s.course)

      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ reviewNumber: 1, courseId: s.course.id, codeReviews: [{ reviewer: s.student.id, toReview: third.id }] })
        .expect(201)

      await eventually(async () => {
        const reviews = await reviewsOf(s.student)
        assert.deepStrictEqual(
          reviews.map(r => [r.reviewNumber, r.toReview]),
          [
            [1, third.id],
            [2, s.student2.id]
          ]
        )
      })
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await as(s.users.student)
        .put('/api/codereviews/bulkinsert')
        .send(assignment())
        .expect(403)
      await as(s.users.otherTeacher)
        .put('/api/codereviews/bulkinsert')
        .send(assignment())
        .expect(403)
      assert.strictEqual(await CodeReview.count(), 0)
    })

    it('rejects malformed input', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ reviewNumber: 1, courseId: s.course.id })
        .expect(400)
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ ...assignment(), codeReviews: [] })
        .expect(400)
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ ...assignment(), codeReviews: [{ reviewer: 'x', toReview: s.student.id }] })
        .expect(400)
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({
          ...assignment(),
          codeReviews: [{ reviewer: s.student.id, toReview: null, repoToReview: 'not a link' }]
        })
        .expect(400)
      assert.strictEqual(await CodeReview.count(), 0)
    })

    it('accepts only GitHub repository links as external repositories', async () => {
      const assignRepo = repoToReview => as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({ ...assignment(), codeReviews: [{ reviewer: s.student.id, toReview: null, repoToReview }] })

      for (const repo of ['javascript:alert(1)//http', 'https://gitlab.com/o/r', 'https://github.com/only-owner', 'https://github.com.evil.example/o/r']) {
        const res = await assignRepo(repo).expect(400)
        assert.match(res.text, /GitHub repository/)
      }
      assert.strictEqual(await CodeReview.count(), 0)
      await assignRepo('https://github.com/owner/repo/tree/main/part2').expect(201)
    })

    it('rejects reviewers from several courses', async () => {
      const foreign = await f.addStudent(await f.createUser(), s.otherCourse)
      const res = await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send({
          ...assignment(),
          codeReviews: [
            { reviewer: s.student.id, toReview: s.student2.id },
            { reviewer: foreign.id, toReview: s.student.id }
          ]
        })
        .expect(400)
      assert.strictEqual(res.text, 'Given student instances are from multiple courses.')
      assert.strictEqual(await CodeReview.count(), 0)
    })

    it('rejects a missing review number', async () => {
      const withoutRound = assignment()
      delete withoutRound.reviewNumber
      await as(s.users.teacher)
        .put('/api/codereviews/bulkinsert')
        .send(withoutRound)
        .expect(400)
      assert.strictEqual(await CodeReview.count(), 0)
    })
  })

  describe('PUT /api/codereviews/grade', () => {
    let items

    beforeEach(async () => {
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
      const checklist = await f.createChecklist(s.course, {
        forCodeReview: true,
        items: {
          Review: [
            { name: 'Helpful', checkedPoints: 1, uncheckedPoints: 0 },
            { name: 'Polite', checkedPoints: 1, uncheckedPoints: 0 }
          ]
        }
      })
      items = checklist.items // eslint-disable-line prefer-destructuring
    })

    const grading = () => ({
      studentInstanceId: s.student.id,
      reviewNumber: 1,
      points: 2,
      checks: [
        { id: items[0].id, checked: true },
        { id: items[1].id, checked: false }
      ]
    })

    it('requires authentication', async () => {
      await anonymous()
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(401)
    })

    it('lets a teacher grade a code review with checklist checks', async () => {
      const res = await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(200)
      assert.strictEqual(res.body.message, 'Code review points updated successfully.')

      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.points, 2)
      const checks = await ReviewCheck.findAll({ where: { codeReviewId: review.id } })
      assert.deepStrictEqual(
        checks.map(c => [c.checklistItemId, c.checked]).sort((a, b) => a[0] - b[0]),
        [
          [items[0].id, true],
          [items[1].id, false]
        ]
      )
    })

    it('updates existing checks when re-grading', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(200)
      await as(s.users.assistant)
        .put('/api/codereviews/grade')
        .send({ ...grading(), points: 1, checks: [{ id: items[0].id, checked: false }] })
        .expect(200)

      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.points, 1)
      const checks = await ReviewCheck.findAll({ where: { codeReviewId: review.id } })
      assert.strictEqual(checks.length, 2)
      assert.strictEqual(checks.find(c => c.checklistItemId === items[0].id).checked, false)
    })

    it('shows graded reviews on the student\'s course page', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(200)
      const res = await as(s.users.student)
        .post('/api/courseinstances/coursepage')
        .send({ course: s.course.ohid })
        .expect(200)
      assert.deepStrictEqual(
        res.body.data.codeReviews.map(cr => [cr.reviewNumber, cr.points]),
        [[1, 2]]
      )
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await as(s.users.student)
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(403)
      await as(s.users.otherTeacher)
        .put('/api/codereviews/grade')
        .send(grading())
        .expect(403)
      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.points, null)
      assert.strictEqual(await ReviewCheck.count(), 0)
    })

    it('validates input', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send({ ...grading(), points: '2' })
        .expect(400)
      await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send({ ...grading(), studentInstanceId: 999999 })
        .expect(400)
    })

    it('answers 400 for a review round that does not exist', async () => {
      await as(s.users.teacher)
        .put('/api/codereviews/grade')
        .send({ ...grading(), reviewNumber: 9 })
        .expect(400)
    })
  })

  describe('PUT /api/codereviews/link', () => {
    beforeEach(async () => {
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
    })

    const link = () => ({
      studentInstanceId: s.student.id,
      reviewNumber: 1,
      linkToReview: 'https://github.com/student2/project/issues/1'
    })

    it('requires authentication', async () => {
      await anonymous()
        .put('/api/codereviews/link')
        .send(link())
        .expect(401)
    })

    it('lets the reviewing student attach a link to the review', async () => {
      const res = await as(s.users.student)
        .put('/api/codereviews/link')
        .send(link())
        .expect(200)
      assert.strictEqual(res.body.message, 'Code review link added successfully.')
      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.linkToReview, 'https://github.com/student2/project/issues/1')
    })

    it('requires an http(s) link', async () => {
      await as(s.users.student)
        .put('/api/codereviews/link')
        .send({ ...link(), linkToReview: 'github.com/x' })
        .expect(400)
      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.linkToReview, null)
    })

    it('is forbidden for anybody but the reviewer', async () => {
      await as(s.users.student2)
        .put('/api/codereviews/link')
        .send(link())
        .expect(403)
      await as(s.users.teacher)
        .put('/api/codereviews/link')
        .send(link())
        .expect(403)
      await as(s.users.student)
        .put('/api/codereviews/link')
        .send({ ...link(), reviewNumber: 2 })
        .expect(403)
      const [review] = await reviewsOf(s.student)
      assert.strictEqual(review.linkToReview, null)
    })
  })

  describe('POST /api/codereviews/delete/:id', () => {
    beforeEach(async () => {
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 1 })
      await f.createCodeReview(s.student, s.student2, { reviewNumber: 2 })
    })

    it('requires authentication', async () => {
      await anonymous()
        .post('/api/codereviews/delete/1')
        .send({ reviewer: s.student.id, codereviewRound: 1 })
        .expect(401)
    })

    it('lets a teacher remove one review round of a student', async () => {
      const res = await as(s.users.teacher)
        .post('/api/codereviews/delete/1')
        .send({ reviewer: s.student.id, codeReviewRound: 1 })
        .expect(200)
      assert.strictEqual(res.body.message, 'Code review link removed successfully.')
      assert.deepStrictEqual(
        (await reviewsOf(s.student)).map(r => r.reviewNumber),
        [2]
      )
    })

    it('is forbidden for students and teachers of other courses', async () => {
      await as(s.users.student)
        .post('/api/codereviews/delete/1')
        .send({ reviewer: s.student.id, codeReviewRound: 1 })
        .expect(403)
      await as(s.users.otherTeacher)
        .post('/api/codereviews/delete/1')
        .send({ reviewer: s.student.id, codeReviewRound: 1 })
        .expect(403)
      assert.strictEqual((await reviewsOf(s.student)).length, 2)
    })

    it('answers 400 for an unknown reviewer', async () => {
      await as(s.users.teacher)
        .post('/api/codereviews/delete/1')
        .send({ reviewer: 999999, codeReviewRound: 1 })
        .expect(400)
    })

    it('answers when there is nothing to delete', async () => {
      const res = await as(s.users.teacher)
        .post('/api/codereviews/delete/1')
        .send({ reviewer: s.student.id, codeReviewRound: 9 })
        .timeout(3000)
      assert.strictEqual(res.status, 404)
    })
  })
})
