/*
 * The pages of the course staff show "no access" to everyone else, e.g. a student who opens one by its
 * address. The backend refuses their requests anyway; this keeps them from seeing forms that cannot be
 * used or a loader that never ends. Sysops may use every page.
 */

const isSysop = user => Boolean(user && user.sysop)

/**
 * By the role in the course page data (state.coursePage, from coursePageInformation). False until the
 * data of this course has arrived, as the store may still hold the role on a previous course.
 */
export const noStaffAccessByRole = (coursePage, courseId, user) =>
  Boolean(coursePage) &&
  coursePage.ohid === courseId &&
  Boolean(coursePage.role) &&
  coursePage.role !== 'teacher' &&
  !isSysop(user)

/**
 * By the course data (state.selectedInstance, from getOneCI), which lists the teacher instances only to
 * the course staff. False until the data of this course has arrived.
 */
export const noStaffAccessByCourse = (course, courseId, user) =>
  Boolean(course) &&
  course.ohid === courseId &&
  Array.isArray(course.teacherInstances) &&
  !isSysop(user) &&
  !course.teacherInstances.some(teacher => user && teacher.userId === user.id)
