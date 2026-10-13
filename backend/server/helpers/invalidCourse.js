// A course marked invalid (#905) was registered or imported by mistake. Nothing is deleted, but only the
// course staff and sysops see it; for everyone else it is as if the course did not exist.
const { TeacherInstance } = require('../models')
const { isSysop } = require('./auth')

const canSeeCourse = async (userId, course) => {
  if (!course.invalid) return true
  if (!userId) return false
  const staff = await TeacherInstance.findOne({ attributes: ['id'], where: { userId, courseInstanceId: course.id } })
  return Boolean(staff) || isSysop(userId)
}

// the teacher responsible for the course (not an assistant) or a sysop
const canMarkInvalid = async (userId, course) => {
  const teacher = await TeacherInstance.findOne({
    attributes: ['id'],
    where: { userId, courseInstanceId: course.id, instructor: false }
  })
  return Boolean(teacher) || isSysop(userId)
}

module.exports = { canSeeCourse, canMarkInvalid }
