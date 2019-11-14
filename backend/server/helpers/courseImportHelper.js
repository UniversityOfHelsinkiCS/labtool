const applicationHelpers = require('./applicationHelper')
const { User, TeacherInstance } = require('../models')

exports.controllerBeforeAuthCheckAction = applicationHelpers.controllerBeforeAuthCheckAction
exports.getInactive = applicationHelpers.getInactive
exports.createCourse = applicationHelpers.createCourse
exports.getActive = applicationHelpers.getActive
exports.hasPermissionToImport = hasPermissionToImport
exports.formatCoursesForList = formatCoursesForList

/**
 * Checks whether an user is allowed to import courses.
 * The user must either be admin or a teacher/instructor on at least one course.
 * @param userId
 */
async function hasPermissionToImport(userId) {
  const user = await User.findOne({
    attributes: ['sysop'],
    where: {
      id: userId
    }
  })
  if (user && user.sysop) {
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
      ends: course.ends,
      instructor: course.instructor
    })
  })

  return result
}
