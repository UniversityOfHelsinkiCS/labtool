// A course from the current term, as if imported from the fake Kurki (Kurki_simulation generates
// TKT20010.2026.S.K.SIM1 for autumn 2026), with paaopettaja as teacher and two registered students.
// Its timestamp must stay after the e2e fixtures seeder: seeders are undone newest first, and the
// e2e seeder's down deletes all ".SIM" courses, which would fail while these students still exist.

const COURSE_ID = 20001
const TEACHER_INSTANCE_ID = 20001
const STUDENT_INSTANCE_IDS = [20001, 20002]

const PAAOPETTAJA = 10010
const TIRAOPISKELIJA1 = 10011
const TIRAOPISKELIJA2 = 10012

module.exports = {
  up: async (queryInterface) => {
    const now = new Date()

    await queryInterface.bulkInsert('CourseInstances', [
      {
        id: COURSE_ID,
        name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
        start: '2026-09-05T00:00:00.000Z',
        end: '2026-12-15T00:00:00.000Z',
        active: true,
        weekAmount: 7,
        weekMaxPoints: 3,
        currentWeek: 1,
        amountOfCodeReviews: 0,
        ohid: 'TKT20010.2026.S.K.SIM1',
        finalReview: false,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('TeacherInstances', [
      {
        id: TEACHER_INSTANCE_ID,
        userId: PAAOPETTAJA,
        courseInstanceId: COURSE_ID,
        instructor: false,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('StudentInstances', [
      {
        id: STUDENT_INSTANCE_IDS[0],
        github: 'https://github.com/tiraopi1/tiralabra-2026',
        projectName: 'Reittihaku',
        userId: TIRAOPISKELIJA1,
        courseInstanceId: COURSE_ID,
        teacherInstanceId: TEACHER_INSTANCE_ID,
        dropped: false,
        validRegistration: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: STUDENT_INSTANCE_IDS[1],
        github: 'https://github.com/tiraopi2/tiralabra-2026',
        projectName: 'Pakkausalgoritmit',
        userId: TIRAOPISKELIJA2,
        courseInstanceId: COURSE_ID,
        teacherInstanceId: TEACHER_INSTANCE_ID,
        dropped: false,
        validRegistration: true,
        createdAt: now,
        updatedAt: now
      }
    ])
  },

  down: async (queryInterface) => {
    const query = sql => queryInterface.sequelize.query(sql)
    const students = `(SELECT id FROM "StudentInstances" WHERE "courseInstanceId" = ${COURSE_ID})`
    const weeks = `(SELECT id FROM "Weeks" WHERE "studentInstanceId" IN ${students})`

    // rows created through the UI on this course
    await query(`DELETE FROM "ReviewChecks" WHERE "weekId" IN ${weeks}`)
    await query(`DELETE FROM "Comments" WHERE "weekId" IN ${weeks}`)
    await query(`DELETE FROM "Weeks" WHERE "studentInstanceId" IN ${students}`)
    await query(`DELETE FROM "WeekDrafts" WHERE "studentInstanceId" IN ${students}`)
    await query(`DELETE FROM "CodeReviews" WHERE "studentInstanceId" IN ${students} OR "toReview" IN ${students}`)
    await query(`DELETE FROM "StudentTags" WHERE "studentInstanceId" IN ${students}`)

    await query(`DELETE FROM "StudentInstances" WHERE "courseInstanceId" = ${COURSE_ID}`)
    await query(`DELETE FROM "TeacherInstances" WHERE "courseInstanceId" = ${COURSE_ID}`)
    await query(`DELETE FROM "CourseInstances" WHERE id = ${COURSE_ID}`)
  }
}
