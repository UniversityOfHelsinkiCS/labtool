const jwt = require('jsonwebtoken')
const {
  User,
  CourseInstance,
  TeacherInstance,
  StudentInstance,
  Week,
  Comment,
  CodeReview,
  Checklist,
  ChecklistItem,
  Tag
} = require('../../server/models')

let counter = 0
const next = () => {
  counter += 1
  return counter
}

/** Signs a token exactly like POST /api/login does. */
const tokenFor = user => jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)

const createUser = (fields = {}) => {
  const n = next()
  return User.create({
    username: `user${n}`,
    firsts: `First${n}`,
    lastname: `Last${n}`,
    email: `user${n}@example.com`,
    studentNumber: `0140${String(n).padStart(5, '0')}`,
    ...fields
  })
}

const createCourse = (fields = {}) => {
  const n = next()
  return CourseInstance.create({
    name: `Test course ${n}`,
    ohid: `TKT${n}.2026.S.K.1`,
    start: new Date('2026-09-01T00:00:00Z'),
    end: new Date('2026-12-20T00:00:00Z'),
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    currentCodeReview: [],
    amountOfCodeReviews: 0,
    finalReview: false,
    ...fields
  })
}

/** instructor: false = the teacher responsible for the course, true = an assistant ("instructor") */
const addTeacher = (user, course, { instructor = false } = {}) => TeacherInstance.create({
  userId: user.id,
  courseInstanceId: course.id,
  instructor
})

const addStudent = (user, course, fields = {}) => StudentInstance.create({
  userId: user.id,
  courseInstanceId: course.id,
  github: `https://github.com/${user.username}/project`,
  projectName: `Project of ${user.username}`,
  ...fields
})

const createWeek = (studentInstance, fields = {}) => Week.create({
  studentInstanceId: studentInstance.id,
  weekNumber: 1,
  points: 2,
  feedback: 'Good work',
  instructorNotes: 'private note',
  notified: false,
  ...fields
})

const createComment = (week, author, fields = {}) => Comment.create({
  weekId: week.id,
  userId: author.id,
  from: `${author.firsts} ${author.lastname}`,
  comment: 'A comment',
  hidden: false,
  notified: false,
  isRead: [author.id],
  createdAt: new Date(),
  ...fields
})

const createCodeReview = (reviewer, toReview, fields = {}) => CodeReview.create({
  studentInstanceId: reviewer.id,
  toReview: toReview ? toReview.id : null,
  reviewNumber: 1,
  ...fields
})

/**
 * Creates a checklist with items. items: { category: [{ name, checkedPoints, uncheckedPoints, ... }] }
 */
const createChecklist = async (course, { week = 1, forCodeReview = false, maxPoints = 3, items = {} } = {}) => {
  const checklist = await Checklist.create({
    courseInstanceId: course.id,
    week: forCodeReview ? null : week,
    forCodeReview,
    maxPoints
  })
  const rows = Object.keys(items).reduce(
    (acc, category) => acc.concat(items[category].map(item => ({ category, ...item }))),
    []
  )
  const created = await Promise.all(
    rows.map((row, index) => ChecklistItem.create({
      checklistId: checklist.id,
      order: index + 1,
      textWhenOn: '',
      textWhenOff: '',
      ...row
    }))
  )
  return { checklist, items: created }
}

const createTag = (fields = {}) => Tag.create({
  name: `tag${next()}`,
  color: 'red',
  courseInstanceId: null,
  ...fields
})

/**
 * The standard cast used by most specs:
 *   course:        an active course
 *   teacher:       responsible teacher of `course` (instructor: false)
 *   assistant:     assistant of `course` (instructor: true)
 *   student, student2: students registered on `course`
 *   outsider:      a logged-in user with no relation to `course`
 *   otherCourse / otherTeacher: a second course and its teacher, who has no rights on `course`
 */
const createScenario = async () => {
  const course = await createCourse()
  const otherCourse = await createCourse()

  const teacherUser = await createUser({ username: 'teacher', firsts: 'Terhi', lastname: 'Teacher' })
  const assistantUser = await createUser({ username: 'assistant', firsts: 'Antti', lastname: 'Assistant' })
  const studentUser = await createUser({ username: 'student', firsts: 'Sanna', lastname: 'Student' })
  const student2User = await createUser({ username: 'student2', firsts: 'Simo', lastname: 'Student' })
  const outsider = await createUser({ username: 'outsider', firsts: 'Olli', lastname: 'Outsider' })
  const otherTeacherUser = await createUser({ username: 'otherteacher', firsts: 'Outi', lastname: 'Other' })

  const teacher = await addTeacher(teacherUser, course, { instructor: false })
  const assistant = await addTeacher(assistantUser, course, { instructor: true })
  const otherTeacher = await addTeacher(otherTeacherUser, otherCourse, { instructor: false })

  const student = await addStudent(studentUser, course)
  const student2 = await addStudent(student2User, course)

  return {
    course,
    otherCourse,
    users: {
      teacher: teacherUser,
      assistant: assistantUser,
      student: studentUser,
      student2: student2User,
      outsider,
      otherTeacher: otherTeacherUser
    },
    teacher,
    assistant,
    otherTeacher,
    student,
    student2
  }
}

module.exports = {
  tokenFor,
  createUser,
  createCourse,
  addTeacher,
  addStudent,
  createWeek,
  createComment,
  createCodeReview,
  createChecklist,
  createTag,
  createScenario
}
