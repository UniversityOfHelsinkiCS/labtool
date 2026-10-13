const { CodeReview, ReviewCheck, StudentInstance, CourseInstance } = require('../models')
const { isGithubRepoUrl, isHttpUrl } = require('../helpers/links')
const { addValueChange, addChecklistChanges, logChange } = require('../helpers/changeLog')
const { requireCourseStaff, requireCanReview } = require('../helpers/auth')
const { badRequest, notFound } = require('../utils/httpError')

/** The row to insert for one assignment sent by the client, or null when it is malformed. */
function formatCodeReview(codeReview, reviewNumber) {
  if (!codeReview || !Number.isInteger(codeReview.reviewer)) {
    return null
  }
  const toReview = Number.isInteger(codeReview.toReview) ? codeReview.toReview : null
  if (toReview === null && !isGithubRepoUrl(codeReview.repoToReview)) {
    return null
  }
  return {
    studentInstanceId: codeReview.reviewer,
    reviewNumber,
    toReview,
    repoToReview: toReview === null ? codeReview.repoToReview : null
  }
}

module.exports = {
  /**
   * Assign code reviews to N students.
   *   permissions: must be teacher/instructor on course
   *
   * @param {*} req
   * @param {*} res
   */
  async bulkInsert(req, res) {
    if (!Array.isArray(req.body.codeReviews) || typeof req.body.reviewNumber !== 'number') {
      throw badRequest('Missing or malformed inputs.')
    }
    if (req.body.codeReviews.length === 0) {
      throw badRequest('No code reviews were provided.')
    }
    const badRepo = req.body.codeReviews.find(codeReview => codeReview && typeof codeReview.toReview !== 'number'
      && !isGithubRepoUrl(codeReview.repoToReview))
    if (badRepo) {
      throw badRequest('A repository to review must be a GitHub repository link, e.g. https://github.com/owner/repo.')
    }
    const values = req.body.codeReviews.map(codeReview => formatCodeReview(codeReview, req.body.reviewNumber))
    if (values.includes(null)) {
      throw badRequest('Malformed code review.')
    }
    // The reviewers and the reviewed students must all exist and be on one course, which is the course
    // the request maker must be a teacher of.
    const referencedIds = [...new Set(values.flatMap(value => [value.studentInstanceId, value.toReview]))]
      .filter(id => id !== null)
    const referenced = await StudentInstance.findAll({
      attributes: ['id', 'courseInstanceId', 'github'],
      where: { id: referencedIds }
    })
    if (referenced.length !== referencedIds.length) {
      throw badRequest('Malformed code review.')
    }
    const courseId = referenced[0].courseInstanceId
    if (referenced.some(si => si.courseInstanceId !== courseId)) {
      throw badRequest('Given student instances are from multiple courses.')
    }
    await requireCourseStaff(req, courseId)

    // remember which repository was assigned, so later repository changes do not move the review (#1132)
    const repoOf = Object.fromEntries(referenced.map(si => [si.id, si.github]))
    values.forEach((value) => {
      value.repoAtAssignment = value.toReview ? repoOf[value.toReview] || null : value.repoToReview
    })
    await CodeReview.bulkCreate(values, { individualHooks: true }) // the beforeCreate hook replaces old rows

    // a new round; the course is the validated one, not one named in the request
    if (req.body.createTrue) {
      await CourseInstance.increment('amountOfCodeReviews', { where: { id: courseId } })
    }
    res.status(201).send({
      message: 'All code reviews inserted.',
      data: req.body
    })
  },

  /**
   * Grade a code review submitted by a student.
   *   permissions: must be teacher/instructor on course
   *
   * @param {*} req
   * @param {*} res
   */
  async grade(req, res) {
    if (typeof req.body.studentInstanceId !== 'number'
      || typeof req.body.reviewNumber !== 'number'
      || typeof req.body.points !== 'number'
      || (req.body.checks !== undefined && req.body.checks !== null && !Array.isArray(req.body.checks))) {
      throw badRequest('Missing or malformed inputs.')
    }
    const studentInstance = await StudentInstance.findByPk(req.body.studentInstanceId)
    if (!studentInstance) {
      throw badRequest('No student instance matched the given ID.')
    }
    const courseId = studentInstance.courseInstanceId
    await requireCourseStaff(req, courseId)
    const codeReview = await CodeReview.findOne({
      where: {
        studentInstanceId: req.body.studentInstanceId,
        reviewNumber: req.body.reviewNumber
      }
    })
    if (!codeReview) {
      throw badRequest('No code review matched the given student instance ID and review number.')
    }
    const checks = req.body.checks || []
    const checksBefore = Object.fromEntries((await ReviewCheck.findAll({ where: { codeReviewId: codeReview.id } }))
      .map(check => [check.checklistItemId, check.checked]))
    await CodeReview.update({ points: req.body.points }, { where: { id: codeReview.id } })
    await Promise.all(checks.map(async (check) => {
      const reviewCheck = await ReviewCheck.findOne({
        where: {
          codeReviewId: codeReview.id,
          checklistItemId: check.id
        }
      })
      if (reviewCheck) {
        await reviewCheck.update({ checked: check.checked })
      } else {
        await ReviewCheck.create({
          checklistItemId: check.id,
          checked: check.checked,
          codeReviewId: codeReview.id
        })
      }
    }))
    // change history (#1129)
    const changes = {}
    addValueChange(changes, 'points', codeReview.points, req.body.points, { numeric: true })
    const checksAfter = Object.fromEntries(checks.map(check => [check.id, check.checked]))
    await addChecklistChanges(changes, checksBefore, { ...checksBefore, ...checksAfter })
    await logChange({
      courseInstanceId: courseId,
      studentInstanceId: studentInstance.id,
      userId: req.decoded.id,
      kind: 'code_review_grade',
      number: req.body.reviewNumber,
      changes,
      initial: codeReview.points === null && Object.keys(checksBefore).length === 0
    })
    res.status(200).send({
      message: 'Code review points updated successfully.',
      data: req.body
    })
  },

  /**
   * Add a link to a code review.
   *   permissions:
   *   1. should be a student
   *   2. student should only be able to create links on reviews the student is assigned to
   *
   * @param {*} req
   * @param {*} res
   */
  async addLink(req, res) {
    if (!isHttpUrl(req.body.linkToReview)) {
      throw badRequest('The link must start with either "http://" or "https://".')
    }
    const isId = value => (typeof value === 'number' || typeof value === 'string')
      && value !== '' && Number.isInteger(Number(value))
    if (!isId(req.body.studentInstanceId) || !isId(req.body.reviewNumber)) {
      throw badRequest('Missing or malformed inputs.')
    }

    const review = await requireCanReview(req, Number(req.body.studentInstanceId), Number(req.body.reviewNumber))
    // the repository that was reviewed when the reviewer added their link (#1132)
    const codeReview = await CodeReview.findByPk(review.id, { include: [{ model: StudentInstance, as: 'toReviews' }] })
    const reviewedRepo = codeReview && codeReview.toReviews ? codeReview.toReviews.github : codeReview && codeReview.repoToReview
    const [modifiedRows] = await CodeReview.update(
      {
        linkToReview: req.body.linkToReview,
        repoAtLinkAdded: reviewedRepo || null
      },
      {
        where: {
          id: review.id
        }
      }
    )
    if (modifiedRows === 0) {
      throw badRequest('No code review matched the given student instance ID and review number.')
    }
    res.status(200).send({
      message: 'Code review link added successfully.',
      data: req.body
    })
  },

  /**
   * Remove one code review from a student.
   *   permissions: must be teacher/instructor on course
   *
   * The review is identified by the body ({ reviewer, codeReviewRound }); the :id of the route is not used.
   *
   * @param {*} req
   * @param {*} res
   */
  async removeOne(req, res) {
    const { reviewer, codeReviewRound } = req.body
    if (!Number.isInteger(reviewer) || !Number.isInteger(codeReviewRound)) {
      throw badRequest('Missing or malformed inputs.')
    }
    const studentInstance = await StudentInstance.findByPk(reviewer)
    if (!studentInstance) {
      throw badRequest('no student with that ID found')
    }
    await requireCourseStaff(req, studentInstance.courseInstanceId, 'must be teacher on the course')

    const deleted = await CodeReview.destroy({
      where: {
        studentInstanceId: reviewer,
        reviewNumber: codeReviewRound
      }
    })
    if (deleted === 0) {
      throw notFound('No code review found for that student and round.')
    }
    return res.status(200).send({
      message: 'Code review link removed successfully.',
      data: req.body
    })
  }
}
