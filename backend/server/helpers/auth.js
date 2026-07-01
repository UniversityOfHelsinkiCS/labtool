const { User, StudentInstance, CodeReview } = require('../models')


// checks if the currently logged in use is a student in the course
// sends 403 on error and returns the studentInstance if succeeds
async function enforceCurrentUserIsStudentOnCourse(req, res, courseId, sendUnAuth = true) {
  // get the user object
  const user = await User.findByPk(req.decoded.id, { attributes: ['id'] })
  if (!user) {
    if (sendUnAuth) res.status(403).send('You are not authorized to perform this action.')

    return false
  }

  // check that the user has a studentinstance on the given course
  const studentInstance = await StudentInstance.findOne({
    attributes: ['id'],
    where: { userId: user.id, courseInstanceId: courseId }
  })

  if (!studentInstance) {
    if (sendUnAuth) res.status(403).send('You are not authorized to perform this action.')

    return false
  }
  return studentInstance
}


async function enforceCurrentUser(req, res, attributes = []) {
  const user = await User.findByPk(req.decoded.id, { attributes: [...attributes, 'id'] })
  if (!user) {
    res.status(403).send('You are not authorized to perform this action.')
    return false
  }

  return user
}


// checks if currently logged in user can review the given review reviewNumber
// sends 403 if review is not found in the users reviews
async function enforceCurrentUserCanReview(req, res, reviewNumber) {
  const user = await User.findByPk(req.decoded.id, { attributes: ['id'] })
  if (!user) {
    res.status(403).send('You are not authorized to perform this action.')
    return false
  }

  const studentInstances = await StudentInstance.findAll({
    attributes: ['id'],
    where: { userId: user.id },
    include: [{
      model: CodeReview,
      as: 'codeReviews'
    }
    ]
  })

  if (!studentInstances || studentInstances.length === 0) {
    res.status(400).send('No student instance matched the given ID.')
    return false
  }

  const codeReviews = studentInstances.map(s => s.codeReviews).flat()
  const foundInReviews = codeReviews.find(r => r.reviewNumber === reviewNumber)
  if (foundInReviews) {
    return foundInReviews
  }

  res.status(403).send('You are not authorized to perform this action.')
  return false
}

module.exports = {
  enforceCurrentUserIsStudentOnCourse,
  enforceCurrentUser,
  enforceCurrentUserCanReview
}
