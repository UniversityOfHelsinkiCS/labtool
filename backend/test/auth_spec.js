const assert = require('assert')

const { User, StudentInstance } = require('../server/models')
const { enforceCurrentUserCanReview } = require('../server/helpers/auth')

function createResponse() {
  const response = {
    statusCode: null,
    body: null
  }
  response.status = (statusCode) => {
    response.statusCode = statusCode
    return response
  }
  response.send = (body) => {
    response.body = body
    return response
  }
  return response
}

describe('Authorization helpers', () => {
  const originalFindUser = User.findByPk
  const originalFindStudentInstance = StudentInstance.findOne

  afterEach(() => {
    User.findByPk = originalFindUser
    StudentInstance.findOne = originalFindStudentInstance
  })

  it('finds the requested review when the same round exists on multiple enrollments', async () => {
    const otherCourseReview = { id: 101, studentInstanceId: 11, reviewNumber: 1 }
    const requestedReview = { id: 202, studentInstanceId: 22, reviewNumber: 1 }
    const enrollments = [
      { id: 11, userId: 1, codeReviews: [otherCourseReview] },
      { id: 22, userId: 1, codeReviews: [requestedReview] }
    ]
    User.findByPk = async () => ({ id: 1 })
    StudentInstance.findOne = async (options) => {
      assert.deepStrictEqual(options.where, { id: 22, userId: 1 })
      assert.deepStrictEqual(options.include[0].where, { reviewNumber: 1 })
      assert.strictEqual(options.include[0].as, 'codeReviews')
      return enrollments.find(enrollment => (
        enrollment.id === options.where.id && enrollment.userId === options.where.userId
      ))
    }

    const response = createResponse()
    const review = await enforceCurrentUserCanReview(
      { decoded: { id: 1 } },
      response,
      22,
      1
    )

    assert.strictEqual(review, requestedReview)
    assert.notStrictEqual(review, otherCourseReview)
    assert.strictEqual(response.statusCode, null)
  })

  it('rejects the request when the authenticated user does not exist', async () => {
    let studentInstanceQueried = false
    User.findByPk = async () => null
    StudentInstance.findOne = async () => {
      studentInstanceQueried = true
    }
    const response = createResponse()

    const review = await enforceCurrentUserCanReview(
      { decoded: { id: 999 } },
      response,
      22,
      1
    )

    assert.strictEqual(review, false)
    assert.strictEqual(studentInstanceQueried, false)
    assert.strictEqual(response.statusCode, 403)
    assert.strictEqual(response.body, 'You are not authorized to perform this action.')
  })

  it('rejects a review outside the requested enrollment or review round', async () => {
    User.findByPk = async () => ({ id: 1 })
    StudentInstance.findOne = async (options) => {
      assert.deepStrictEqual(options.where, { id: 22, userId: 1 })
      assert.deepStrictEqual(options.include[0].where, { reviewNumber: 2 })
      return null
    }
    const response = createResponse()

    const review = await enforceCurrentUserCanReview(
      { decoded: { id: 1 } },
      response,
      22,
      2
    )

    assert.strictEqual(review, false)
    assert.strictEqual(response.statusCode, 403)
    assert.strictEqual(response.body, 'You are not authorized to perform this action.')
  })

  it('rejects an enrollment with no matching code reviews', async () => {
    User.findByPk = async () => ({ id: 1 })
    StudentInstance.findOne = async () => ({ codeReviews: [] })
    const response = createResponse()

    const review = await enforceCurrentUserCanReview(
      { decoded: { id: 1 } },
      response,
      22,
      1
    )

    assert.strictEqual(review, false)
    assert.strictEqual(response.statusCode, 403)
  })
})
