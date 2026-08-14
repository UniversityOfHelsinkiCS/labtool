const assert = require('assert')

const { CodeReview, StudentInstance, User } = require('../server/models')
const codeReviewsController = require('../server/controllers/codeReviews')
const logger = require('../server/utils/logger')

function createResponse() {
  const response = {
    statusCode: null,
    body: null,
    ended: false
  }
  response.status = (statusCode) => {
    response.statusCode = statusCode
    return response
  }
  response.send = (body) => {
    response.body = body
    return response
  }
  response.end = () => {
    response.ended = true
    return response
  }
  return response
}

function createRequest(body) {
  return {
    authenticated: { success: true },
    decoded: { id: 7 },
    body
  }
}

describe('Code review link controller', () => {
  const originalFindUser = User.findByPk
  const originalFindStudentInstance = StudentInstance.findOne
  const originalUpdateCodeReview = CodeReview.update
  const originalLoggerError = logger.error
  const validBody = {
    studentInstanceId: 22,
    reviewNumber: 2,
    linkToReview: 'https://github.com/student/project/issues/42'
  }
  const malformedFields = [
    { field: 'studentInstanceId', value: '22' },
    { field: 'reviewNumber', value: '2' },
    { field: 'linkToReview', value: null }
  ]

  function authorizeRequestedReview(reviewId = 909) {
    User.findByPk = async userId => ({ id: userId })
    StudentInstance.findOne = async (options) => {
      assert.deepStrictEqual(options.where, { id: 22, userId: 7 })
      assert.deepStrictEqual(options.include[0].where, { reviewNumber: 2 })
      return {
        codeReviews: [{
          id: reviewId,
          studentInstanceId: 22,
          reviewNumber: 2
        }]
      }
    }
  }

  afterEach(() => {
    User.findByPk = originalFindUser
    StudentInstance.findOne = originalFindStudentInstance
    CodeReview.update = originalUpdateCodeReview
    logger.error = originalLoggerError
  })

  malformedFields.forEach(({ field, value }) => {
    it(`rejects a malformed ${field} before querying the database`, async () => {
      let databaseQueried = false
      User.findByPk = async () => {
        databaseQueried = true
      }
      CodeReview.update = async () => {
        databaseQueried = true
      }
      const response = createResponse()

      await codeReviewsController.addLink(
        createRequest({ ...validBody, [field]: value }),
        response
      )

      assert.strictEqual(response.statusCode, 400)
      assert.strictEqual(response.body, 'Missing or malformed inputs.')
      assert.strictEqual(databaseQueried, false)
    })
  })

  it('rejects a link without an HTTP or HTTPS scheme before querying the database', async () => {
    let databaseQueried = false
    User.findByPk = async () => {
      databaseQueried = true
    }
    const response = createResponse()

    await codeReviewsController.addLink(
      createRequest({ ...validBody, linkToReview: 'github.com/student/project/issues/42' }),
      response
    )

    assert.strictEqual(response.statusCode, 400)
    assert.strictEqual(response.body, 'The link must start with either "http://" or "https://".')
    assert.strictEqual(databaseQueried, false)
  })

  it('updates only the primary key returned by the authorized enrollment lookup', async () => {
    authorizeRequestedReview(909)
    let updatedValues
    let updateOptions
    CodeReview.update = async (values, options) => {
      updatedValues = values
      updateOptions = options
      return [1]
    }
    const request = createRequest(validBody)
    const response = createResponse()

    await codeReviewsController.addLink(request, response)

    assert.deepStrictEqual(updatedValues, { linkToReview: validBody.linkToReview })
    assert.deepStrictEqual(updateOptions, { where: { id: 909 } })
    assert.strictEqual(response.statusCode, 200)
    assert.deepStrictEqual(response.body, {
      message: 'Code review link added successfully.',
      data: validBody
    })
  })

  it('does not update when the requested enrollment and review are not owned by the user', async () => {
    User.findByPk = async () => ({ id: 7 })
    StudentInstance.findOne = async () => null
    let updateCalled = false
    CodeReview.update = async () => {
      updateCalled = true
      return [1]
    }
    const response = createResponse()

    await codeReviewsController.addLink(createRequest(validBody), response)

    assert.strictEqual(updateCalled, false)
    assert.strictEqual(response.statusCode, 403)
    assert.strictEqual(response.body, 'You are not authorized to perform this action.')
  })

  it('reports an error when the exact review row no longer exists at update time', async () => {
    authorizeRequestedReview()
    CodeReview.update = async () => [0]
    const response = createResponse()

    await codeReviewsController.addLink(createRequest(validBody), response)

    assert.strictEqual(response.statusCode, 400)
    assert.strictEqual(
      response.body,
      'No code review matched the given student instance ID and review number.'
    )
  })

  it('returns an unexpected-error response when persistence fails', async () => {
    authorizeRequestedReview()
    const persistenceError = new Error('database unavailable')
    let loggedError
    CodeReview.update = async () => {
      throw persistenceError
    }
    logger.error = (error) => {
      loggedError = error
    }
    const response = createResponse()

    await codeReviewsController.addLink(createRequest(validBody), response)

    assert.strictEqual(loggedError, persistenceError)
    assert.strictEqual(response.statusCode, 500)
    assert.strictEqual(response.body, 'Unexpected error. Please try again.')
  })
})
