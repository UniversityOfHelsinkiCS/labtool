// Fixtures for the Playwright e2e suite (e2e/). Only active when E2E_SEED=true, so the dev
// stack is unaffected. Keep the ids and names in sync with e2e/fixtures/data.ts.
//
// Every spec works on its own course instance so that specs stay independent of each other
// and of their run order; the suite reseeds (down + up) once before every run.

const Sequelize = require('sequelize')

const E2E_ENABLED = process.env.E2E_SEED === 'true'

// bulkInsert cannot infer the type of an empty JS array
const EMPTY_INTEGER_ARRAY = Sequelize.literal('\'{}\'::integer[]')

// demo users from 20180326073413-demo-users.js
const TEACHER_USER_ID = 10010 // paaopettaja, teacher + sysop
const REGISTERED_STUDENT_USER_ID = 10011 // tiraopiskelija1

// users owned by this seeder
const USERS = {
  SECOND_STUDENT: 19001,
  ASSISTANT: 19002,
  EMAIL_CHANGER: 19003,
  NO_EMAIL: 19004,
  BOUNCING: 19005 // address rejected by the e2e stack's Mailpit (issue #1141)
}

const COURSES = {
  MAIN: 90001,
  SETTINGS: 90002,
  CHECKLIST: 90003,
  CODE_REVIEW: 90004,
  TAGS: 90005,
  COMMENTS: 90006,
  DRAFT: 90007,
  STAFF: 90008,
  DROP: 90009,
  EMAIL: 90010,
  BOUNCE: 90011,
  GRADING: 90012 // two instructors grading the same student (#1127)
}

// the assistant on the grading course; GRADING_ASSIGNED_STUDENT is assigned to them
const GRADING_ASSISTANT_INSTANCE = 90112

const COURSE_IDS = Object.values(COURSES)
const USER_IDS = Object.values(USERS)

const daysFromNow = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const course = (id, name, ohid, now, overrides = {}) => ({
  id,
  name,
  start: daysFromNow(-21),
  end: daysFromNow(28),
  active: true,
  weekAmount: 7,
  weekMaxPoints: 3,
  currentWeek: 1,
  currentCodeReview: EMPTY_INTEGER_ARRAY,
  codeReviewActive: false,
  amountOfCodeReviews: 0,
  ohid,
  finalReview: false,
  finalReviewHasPoints: true,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

// one teacher instance for paaopettaja per course, with the same id as the course
const teacherInstance = (courseInstanceId, now) => ({
  id: courseInstanceId,
  userId: TEACHER_USER_ID,
  courseInstanceId,
  instructor: false,
  createdAt: now,
  updatedAt: now
})

const studentInstance = (id, userId, courseInstanceId, now, overrides = {}) => ({
  id,
  github: `http://github.com/e2e/project-${id}`,
  projectName: `E2E Project ${id}`,
  userId,
  courseInstanceId,
  teacherInstanceId: null,
  dropped: false,
  validRegistration: true,
  createdAt: now,
  updatedAt: now,
  ...overrides
})

const inList = ids => `(${ids.join(', ')})`

module.exports = {
  up: async (queryInterface) => {
    if (!E2E_ENABLED) {
      return
    }

    const now = new Date()

    await queryInterface.bulkInsert('Users', [
      {
        id: USERS.SECOND_STUDENT,
        username: 'e2eopiskelija',
        email: 'sanni.toinen@example.com',
        firsts: 'Sanni',
        lastname: 'Toinen',
        studentNumber: '019000001',
        teacher: false,
        sysop: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: USERS.ASSISTANT,
        username: 'e2eassistentti',
        email: 'aatu.assistentti@example.com',
        firsts: 'Aatu',
        lastname: 'Assistentti',
        studentNumber: '019000002',
        teacher: false,
        sysop: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: USERS.EMAIL_CHANGER,
        username: 'e2esahkoposti',
        email: 'eemeli.vanha@example.com',
        firsts: 'Eemeli',
        lastname: 'Postinen',
        studentNumber: '019000003',
        teacher: false,
        sysop: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: USERS.NO_EMAIL,
        username: 'e2eilmanpostia',
        email: null,
        firsts: 'Iida',
        lastname: 'Postiton',
        studentNumber: '019000004',
        teacher: false,
        sysop: false,
        createdAt: now,
        updatedAt: now
      },
      {
        id: USERS.BOUNCING,
        username: 'e2epalautuva',
        email: 'bounce@rejected.test',
        firsts: 'Pauli',
        lastname: 'Palautuva',
        studentNumber: '019000005',
        teacher: false,
        sysop: false,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('CourseInstances', [
      course(COURSES.MAIN, 'E2E Test Course', 'E2E.TEST.COURSE.1', now, {
        currentCodeReview: [1],
        codeReviewActive: true,
        amountOfCodeReviews: 1
      }),
      course(COURSES.SETTINGS, 'E2E Settings Course', 'E2E.SETTINGS.COURSE.1', now),
      course(COURSES.CHECKLIST, 'E2E Checklist Course', 'E2E.CHECKLIST.COURSE.1', now),
      course(COURSES.CODE_REVIEW, 'E2E Code Review Course', 'E2E.CODEREVIEW.COURSE.1', now),
      course(COURSES.TAGS, 'E2E Tags Course', 'E2E.TAGS.COURSE.1', now),
      course(COURSES.COMMENTS, 'E2E Comments Course', 'E2E.COMMENTS.COURSE.1', now),
      course(COURSES.DRAFT, 'E2E Draft Course', 'E2E.DRAFT.COURSE.1', now),
      course(COURSES.STAFF, 'E2E Staff Course', 'E2E.STAFF.COURSE.1', now),
      course(COURSES.DROP, 'E2E Drop Course', 'E2E.DROP.COURSE.1', now),
      course(COURSES.EMAIL, 'E2E Email Course', 'E2E.EMAIL.COURSE.1', now),
      course(COURSES.BOUNCE, 'E2E Bounce Course', 'E2E.BOUNCE.COURSE.1', now),
      course(COURSES.GRADING, 'E2E Grading Course', 'E2E.GRADING.COURSE.1', now)
    ])

    await queryInterface.bulkInsert(
      'TeacherInstances',
      COURSE_IDS.map(id => teacherInstance(id, now))
    )
    await queryInterface.bulkInsert('TeacherInstances', [
      {
        ...teacherInstance(COURSES.GRADING, now),
        id: GRADING_ASSISTANT_INSTANCE,
        userId: USERS.ASSISTANT,
        instructor: true
      }
    ])

    await queryInterface.bulkInsert('StudentInstances', [
      studentInstance(90001, REGISTERED_STUDENT_USER_ID, COURSES.MAIN, now, {
        github: 'http://github.com/e2e/e2e-project',
        projectName: 'E2E Project',
        teacherInstanceId: COURSES.MAIN
      }),
      studentInstance(90003, REGISTERED_STUDENT_USER_ID, COURSES.CHECKLIST, now),
      studentInstance(90004, REGISTERED_STUDENT_USER_ID, COURSES.CODE_REVIEW, now),
      studentInstance(90014, USERS.SECOND_STUDENT, COURSES.CODE_REVIEW, now),
      studentInstance(90005, REGISTERED_STUDENT_USER_ID, COURSES.TAGS, now),
      studentInstance(90015, USERS.SECOND_STUDENT, COURSES.TAGS, now),
      // the student has an instructor so that comment email notifications have a recipient
      studentInstance(90006, REGISTERED_STUDENT_USER_ID, COURSES.COMMENTS, now, {
        teacherInstanceId: COURSES.COMMENTS
      }),
      studentInstance(90007, REGISTERED_STUDENT_USER_ID, COURSES.DRAFT, now),
      studentInstance(90008, REGISTERED_STUDENT_USER_ID, COURSES.STAFF, now),
      studentInstance(90009, USERS.SECOND_STUDENT, COURSES.DROP, now),
      studentInstance(90010, REGISTERED_STUDENT_USER_ID, COURSES.EMAIL, now),
      studentInstance(90020, USERS.SECOND_STUDENT, COURSES.EMAIL, now),
      studentInstance(90011, REGISTERED_STUDENT_USER_ID, COURSES.BOUNCE, now),
      studentInstance(90021, USERS.BOUNCING, COURSES.BOUNCE, now),
      studentInstance(90012, REGISTERED_STUDENT_USER_ID, COURSES.GRADING, now),
      studentInstance(90022, USERS.SECOND_STUDENT, COURSES.GRADING, now, {
        teacherInstanceId: GRADING_ASSISTANT_INSTANCE
      })
    ])

    // already reviewed weeks for the comment and email specs
    await queryInterface.bulkInsert('Weeks', [
      {
        id: 90006,
        points: 2,
        grade: null,
        weekNumber: 1,
        feedback: 'Seeded feedback for the comments spec.',
        instructorNotes: '',
        notified: false,
        studentInstanceId: 90006,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 90010,
        points: 1.5,
        grade: null,
        weekNumber: 1,
        feedback: 'Seeded feedback for the email spec.',
        instructorNotes: '',
        notified: false,
        studentInstanceId: 90010,
        createdAt: now,
        updatedAt: now
      }
    ])
  },

  down: async (queryInterface) => {
    if (!E2E_ENABLED) {
      return
    }

    const query = sql => queryInterface.sequelize.query(sql)

    const studentInstances = `(SELECT id FROM "StudentInstances"
      WHERE "courseInstanceId" IN ${inList(COURSE_IDS)} OR "userId" IN ${inList(USER_IDS)})`
    const weeks = `(SELECT id FROM "Weeks" WHERE "studentInstanceId" IN ${studentInstances})`
    const codeReviews = `(SELECT id FROM "CodeReviews"
      WHERE "studentInstanceId" IN ${studentInstances} OR "toReview" IN ${studentInstances})`
    const checklists = `(SELECT id FROM "Checklists" WHERE "courseInstanceId" IN ${inList(COURSE_IDS)})`
    const tags = `(SELECT id FROM "Tags" WHERE "courseInstanceId" IN ${inList(COURSE_IDS)})`
    const checklistItems = `(SELECT id FROM "ChecklistItems" WHERE "checklistId" IN ${checklists})`

    // rows created by the tests through the UI
    await query(`DELETE FROM "ReviewChecks"
      WHERE "weekId" IN ${weeks} OR "codeReviewId" IN ${codeReviews} OR "checklistItemId" IN ${checklistItems}`)
    await query(`DELETE FROM "Comments" WHERE "weekId" IN ${weeks} OR "userId" IN ${inList(USER_IDS)}`)
    await query('DELETE FROM "Comments" WHERE "weekId" NOT IN (SELECT id FROM "Weeks")')
    await query(`DELETE FROM "Weeks" WHERE "studentInstanceId" IN ${studentInstances}`)
    await query(`DELETE FROM "WeekDrafts" WHERE "studentInstanceId" IN ${studentInstances}`)
    await query(`DELETE FROM "CodeReviews" WHERE id IN ${codeReviews}`)
    await query(`DELETE FROM "StudentTags" WHERE "studentInstanceId" IN ${studentInstances} OR "tagId" IN ${tags}`)
    await query(`DELETE FROM "Tags" WHERE id IN ${tags}`)
    await query(`DELETE FROM "ChecklistItems" WHERE "checklistId" IN ${checklists}`)
    await query(`DELETE FROM "Checklists" WHERE id IN ${checklists}`)

    // courses imported from the fake Kurki, whose generated course codes end in "SIM<n>"
    const importedCourses = '(SELECT id FROM "CourseInstances" WHERE ohid LIKE \'%.SIM%\')'
    await query(`DELETE FROM "TeacherInstances" WHERE "courseInstanceId" IN ${importedCourses}`)
    await query(`DELETE FROM "CourseInstances" WHERE id IN ${importedCourses}`)

    // seeded rows
    await query(`DELETE FROM "StudentInstances" WHERE id IN ${studentInstances}`)
    await query(`DELETE FROM "TeacherInstances"
      WHERE "courseInstanceId" IN ${inList(COURSE_IDS)} OR "userId" IN ${inList(USER_IDS)}`)
    await query(`DELETE FROM "CourseInstances" WHERE id IN ${inList(COURSE_IDS)}`)
    await query(`DELETE FROM "Users" WHERE id IN ${inList(USER_IDS)}`)
  }
}
