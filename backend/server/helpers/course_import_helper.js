const application_helpers = require('./application_helper')
const { User, TeacherInstance } = require('../models')

exports.controller_before_auth_check_action = application_helpers.controller_before_auth_check_action
exports.getInactive = application_helpers.getInactive
exports.createCourse = application_helpers.createCourse
exports.getActive = application_helpers.getActive
exports.hasPermissionToImport = hasPermissionToImport
exports.formatCoursesForList = formatCoursesForList

/**
 * Checks whether an user is allowed to import courses.
 * The user must either be admin or a teacher/instructor on at least one course.
 * @param userId
 */
async function hasPermissionToImport(userId) {
  const user = await User.findOne({
    attributes: ['admin'],
    where: {
      id: userId
    }
  })
  if (user && user.admin) {
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
  const result = []

  courses.forEach((course) => {
    result.push({
      hid: course.id,
      cname: course.name,
      starts: course.starts,
      ends: course.ends
    })
  })

  return result
}
