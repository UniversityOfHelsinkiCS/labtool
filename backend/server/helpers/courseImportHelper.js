const applicationHelpers = require('./applicationHelper')
const { TeacherInstance } = require('../models')
const { isSysop } = require('./auth')

exports.getInactive = applicationHelpers.getInactive
exports.createCourse = applicationHelpers.createCourse
exports.KurkiError = applicationHelpers.KurkiError
exports.hasPermissionToImport = hasPermissionToImport
exports.formatCoursesForList = formatCoursesForList

/**
 * Checks whether an user is allowed to import courses.
 * The user must either be admin or a teacher/instructor on at least one course.
 * @param userId
 */
async function hasPermissionToImport(userId) {
  if (await isSysop(userId)) {
    return true
  }

  const teacher = await TeacherInstance.findOne({
    attributes: ['id'],
    where: {
      userId
    }
  })

  return !!(teacher && teacher.id)
}

/**
 * Formats an array of courses for returning to client
 * @param courses
 */
function formatCoursesForList(courses) {
  return courses.map(course => ({
    hid: course.id,
    cname: course.name,
    starts: course.starts,
    ends: course.ends,
    instructor: course.instructor
  }))
}
