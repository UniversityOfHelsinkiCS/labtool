const E2E_ENABLED = process.env.E2E_SEED === 'true'

const COURSE_INSTANCE_ID = 90001
const TEACHER_INSTANCE_ID = 90001
const STUDENT_INSTANCE_ID = 90001

const TEACHER_USER_ID = 10010
const REGISTERED_STUDENT_USER_ID = 10011

const daysFromNow = days => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

module.exports = {
  up: async queryInterface => {
    if (!E2E_ENABLED) {
      return
    }

    const now = new Date()

    await queryInterface.bulkInsert('CourseInstances', [
      {
        id: COURSE_INSTANCE_ID,
        name: 'E2E Test Course',
        start: daysFromNow(-21),
        end: daysFromNow(28),
        active: true,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        currentCodeReview: [1],
        codeReviewActive: true,
        amountOfCodeReviews: 1,
        ohid: 'E2E.TEST.COURSE.1',
        finalReview: false,
        finalReviewHasPoints: true,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('TeacherInstances', [
      {
        id: TEACHER_INSTANCE_ID,
        userId: TEACHER_USER_ID,
        courseInstanceId: COURSE_INSTANCE_ID,
        instructor: false,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('StudentInstances', [
      {
        id: STUDENT_INSTANCE_ID,
        github: 'http://github.com/e2e/e2e-project',
        projectName: 'E2E Project',
        userId: REGISTERED_STUDENT_USER_ID,
        courseInstanceId: COURSE_INSTANCE_ID,
        teacherInstanceId: TEACHER_INSTANCE_ID,
        dropped: false,
        validRegistration: true,
        createdAt: now,
        updatedAt: now
      }
    ])
  },

  down: async queryInterface => {
    if (!E2E_ENABLED) {
      return
    }

    const studentInstances = `(SELECT id FROM "StudentInstances" WHERE "courseInstanceId" = ${COURSE_INSTANCE_ID})`

    await queryInterface.sequelize.query(`DELETE FROM "Weeks" WHERE "studentInstanceId" IN ${studentInstances}`)
    await queryInterface.sequelize.query(`DELETE FROM "WeekDrafts" WHERE "studentInstanceId" IN ${studentInstances}`)
    await queryInterface.sequelize.query(`DELETE FROM "Comments" WHERE "weekId" NOT IN (SELECT id FROM "Weeks")`)
    await queryInterface.bulkDelete('StudentInstances', { courseInstanceId: COURSE_INSTANCE_ID })
    await queryInterface.bulkDelete('TeacherInstances', { courseInstanceId: COURSE_INSTANCE_ID })
    await queryInterface.bulkDelete('CourseInstances', { id: COURSE_INSTANCE_ID })
  }
}
