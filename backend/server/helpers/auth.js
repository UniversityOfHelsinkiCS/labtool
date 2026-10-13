const { User, StudentInstance, TeacherInstance, CodeReview } = require('../models')
const { forbidden } = require('../utils/httpError')

/*
 * Permission checks. Authentication itself is enforced for every API route by requireAuth in app.js,
 * so handlers can rely on req.decoded. The is* functions answer a question, the require* functions
 * throw a 403 HttpError when the answer is no.
 */

/** The teacher instance id of the user on the course, or null. Course staff = teachers and assistants. */
async function getTeacherId(userId, courseInstanceId) {
  const teacher = await TeacherInstance.findOne({
    attributes: ['id'],
    where: { userId, courseInstanceId }
  })
  return teacher ? teacher.id : null
}

async function isCourseStaff(userId, courseInstanceId) {
  return (await getTeacherId(userId, courseInstanceId)) !== null
}

async function isSysop(userId) {
  const user = await User.findByPk(userId, { attributes: ['sysop'] })
  return Boolean(user && user.sysop)
}

/** The student instance of the user on the course, or null. */
async function findStudentInstance(userId, courseInstanceId) {
  return StudentInstance.findOne({
    attributes: ['id'],
    where: { userId, courseInstanceId }
  })
}

async function requireCourseStaff(req, courseInstanceId, message = 'You must be a teacher of the course to perform this action.') {
  const teacherInstanceId = await getTeacherId(req.decoded.id, courseInstanceId)
  if (!teacherInstanceId) {
    throw forbidden(message)
  }
  return teacherInstanceId
}

async function requireSysop(req, message) {
  if (!(await isSysop(req.decoded.id))) {
    throw forbidden(message)
  }
}

/** The logged in user, with the given attributes. */
async function requireCurrentUser(req, attributes = []) {
  const user = await User.findByPk(req.decoded.id, { attributes: [...attributes, 'id'] })
  if (!user) {
    throw forbidden()
  }
  return user
}

/** The student instance of the logged in user on the course. */
async function requireStudentOnCourse(req, courseInstanceId) {
  const studentInstance = await findStudentInstance(req.decoded.id, courseInstanceId)
  if (!studentInstance) {
    throw forbidden()
  }
  return studentInstance
}

/** The code review the logged in user, as the given student instance, is assigned to. */
async function requireCanReview(req, studentInstanceId, reviewNumber) {
  const studentInstance = await StudentInstance.findOne({
    attributes: ['id'],
    where: {
      id: studentInstanceId,
      userId: req.decoded.id
    },
    include: [{
      model: CodeReview,
      as: 'codeReviews',
      where: { reviewNumber }
    }]
  })
  if (!studentInstance || studentInstance.codeReviews.length === 0) {
    throw forbidden()
  }
  return studentInstance.codeReviews[0]
}

module.exports = {
  getTeacherId,
  isCourseStaff,
  isSysop,
  findStudentInstance,
  requireCourseStaff,
  requireSysop,
  requireCurrentUser,
  requireStudentOnCourse,
  requireCanReview
}
