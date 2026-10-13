const Sequelize = require('sequelize')

const { hiddenFromStudents } = require('./finalReview')
const { isCourseStaff } = require('./auth')
const { Week, CourseInstance, StudentInstance, TeacherInstance } = require('../models')

exports.findByUserStudentInstance = findByUserStudentInstance
exports.checkHasCommentPermission = checkHasCommentPermission
exports.getRoleToViewStudentInstance = getRoleToViewStudentInstance

/**
 * Check if teacher or correct student. Assumes auth already successful
 * @param user
 * @param weekId
 * @returns {Promise<'teacher'|'student'|false>} the role that grants the permission, or false
 */
async function checkHasCommentPermission(userId, weekId) {
  // get actual week instance to get student instance
  const week = await Week.findOne({
    where: {
      id: weekId
    }
  })
  if (!week) {
    return false
  }

  // get student instance to check if the user is a correct student
  // and also to get a course
  const student = await StudentInstance.findOne({
    where: {
      id: week.studentInstanceId
    }
  })
  if (!student) {
    return false
  }

  // get course id to get teacher
  const course = await CourseInstance.findOne({
    where: {
      id: student.courseInstanceId
    }
  })
  if (!course) {
    return false
  }

  // ok, user is a teacher or an assistant on the course?
  if (await isCourseStaff(userId, course.id)) {
    return 'teacher'
  }
  // ok, user is the student whose review we are trying to comment on?
  // ...unless the course is invalid (#905) or it is a final review that is still hidden from students
  if (student.userId === userId && !course.invalid && !hiddenFromStudents(course, week.weekNumber)) {
    return 'student'
  }
  return false
}

/**
 * The role through which a user (the viewer) may see the student instance of another user (or their own)
 * @param {number} viewerId the logged in user
 * @param {number} courseInstanceId
 * @param {number} userId the student
 * @returns {Promise<'teacher'|'student'|'assistant'|'other assistant'|null>}
 */
async function getRoleToViewStudentInstance(viewerId, courseInstanceId, userId) {
  const adminTeacherInstance = await TeacherInstance.findOne({ where: {
    userId: viewerId,
    courseInstanceId,
    instructor: false
  } })

  // Logged in user is teacher (not instructor) on the course
  if (adminTeacherInstance) {
    return 'teacher'
  }

  // Find student instance where logged in user is either student or assigned teacher
  const studentInstance = await StudentInstance.findOne({
    where: {
      courseInstanceId,
      userId,
      [Sequelize.Op.or]: [
        { userId: viewerId },
        { '$TeacherInstance.userId$': viewerId }
      ]
    },
    include: [TeacherInstance]
  })

  if (studentInstance && studentInstance.userId === viewerId) {
    return 'student'
  }
  if (studentInstance) {
    return 'assistant'
  }

  // Logged in user is assistant on course, even for some other student
  if (await isCourseStaff(viewerId, courseInstanceId)) {
    return 'other assistant'
  }

  return null
}

/**
 * The (valid) courses on which the user is a student. Each course carries the fields of the user's
 * student instance too (github, projectName, dropped, ...), as the old SQL join did; `id` is the course id.
 * @param {number} userId
 */
async function findByUserStudentInstance(userId) {
  const courses = await CourseInstance.findAll({
    where: { invalid: false },
    include: [{
      model: StudentInstance,
      as: 'courseInstances',
      required: true,
      where: { userId }
    }]
  })
  return courses.map((course) => {
    const { courseInstances: [studentInstance], ...courseFields } = course.get({ plain: true })
    return { ...courseFields, ...studentInstance, id: course.id }
  })
}
