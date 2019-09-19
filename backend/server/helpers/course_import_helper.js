const application_helpers = require('./application_helper')
const { User, TeacherInstance } = require('../models')

exports.controller_before_auth_check_action = application_helpers.controller_before_auth_check_action
exports.getInactive = application_helpers.getInactive
exports.createCourse = application_helpers.createCourse
exports.getActive = application_helpers.getActive
exports.hasPermissionToImport = hasPermissionToImport
exports.formatCoursesForList = formatCoursesForList

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
