// A course from the current term, as if imported from the fake Kurki (Kurki_simulation generates
// TKT20010.2026.S.K.SIM1 for autumn 2026). paaopettaja is the responsible teacher and tiraohjaaja an
// assistant; four registered students are split between them. Pekka Palautuva's address is rejected by
// the Mailpit container in the dev stack, to reproduce email delivery failures (issue #1141).
// Week 1 has a checklist with topic descriptions (#525).
// Its timestamp must stay after the e2e fixtures seeder: seeders are undone newest first, and the
// e2e seeder's down deletes all ".SIM" courses, which would fail while these students still exist.

const COURSE_ID = 20001
const TEACHER_INSTANCE_ID = 20001 // paaopettaja
const ASSISTANT_INSTANCE_ID = 20002 // tiraohjaaja

const PAAOPETTAJA = 10010
const TIRAOHJAAJA = 10015
const TIRAOPISKELIJA1 = 10011
const TIRAOPISKELIJA2 = 10012
const OTMOPISKELIJA1 = 10021
const BOUNCING_STUDENT = 29001

const CHECKLIST_ID = 20001

// [topic, description, [[id, name, textWhenOn, textWhenOff, checkedPoints, uncheckedPoints], ...]]
const CHECKLIST_TOPICS = [
  ['Ohjelmakoodi', 'Koodin laatu ja toimivuus: luettavuus, rakenne ja algoritmin oikeellisuus.', [
    [20001, 'Koodi on selkeää', 'Koodi on selkeää ja hyvin jäsenneltyä.', 'Koodin luettavuutta kannattaa parantaa.', 1, 0],
    [20002, 'Algoritmi toimii', 'Algoritmi toimii oikein.', 'Algoritmissa on vielä virheitä.', 1, 0]
  ]],
  ['Testaus', 'Yksikkötestit kattavat ydinlogiikan ja ajetaan automaattisesti.', [
    [20003, 'Yksikkötestit', 'Yksikkötestit on tehty.', 'Yksikkötestit puuttuvat.', 0.5, 0],
    [20004, 'Testikattavuusraportti', 'Testikattavuus on raportoitu.', 'Testikattavuusraportti puuttuu.', 0, 0]
  ]],
  ['Dokumentaatio', 'Viikkoraportti, määrittelydokumentti ja tuntikirjanpito.', [
    [20005, 'Määrittelydokumentti', 'Määrittelydokumentti on kunnossa.', 'Määrittelydokumentti puuttuu.', 0.5, 0],
    [20006, 'Tuntikirjanpito', 'Tuntikirjanpito on ajan tasalla.', 'Tuntikirjanpito puuttuu.', 0, -0.5]
  ]]
]

// [student instance id, user, project, assigned teacher instance]
const STUDENTS = [
  [20001, TIRAOPISKELIJA1, 'Reittihaku', TEACHER_INSTANCE_ID],
  [20002, TIRAOPISKELIJA2, 'Pakkausalgoritmit', ASSISTANT_INSTANCE_ID],
  [20003, BOUNCING_STUDENT, 'Polunetsintä', TEACHER_INSTANCE_ID],
  [20004, OTMOPISKELIJA1, 'Shakkitekoäly', ASSISTANT_INSTANCE_ID]
]

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

    await queryInterface.bulkInsert('Users', [
      {
        id: BOUNCING_STUDENT,
        username: 'tiraopiskelija3',
        firsts: 'Pekka',
        lastname: 'Palautuva',
        email: 'pekka.palautuva@rejected.test',
        studentNumber: '014999999',
        teacher: false,
        sysop: false,
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
      },
      {
        id: ASSISTANT_INSTANCE_ID,
        userId: TIRAOHJAAJA,
        courseInstanceId: COURSE_ID,
        instructor: true,
        createdAt: now,
        updatedAt: now
      }
    ])

    await queryInterface.bulkInsert('StudentInstances', STUDENTS.map(([id, userId, projectName, teacherInstanceId]) => ({
      id,
      github: `https://github.com/tiralabra-2026/student-${id}`,
      projectName,
      userId,
      courseInstanceId: COURSE_ID,
      teacherInstanceId,
      dropped: false,
      validRegistration: true,
      createdAt: now,
      updatedAt: now
    })))

    await queryInterface.bulkInsert('Checklists', [
      {
        id: CHECKLIST_ID,
        week: 1,
        forCodeReview: false,
        master: false,
        maxPoints: 3,
        courseInstanceId: COURSE_ID,
        topicDescriptions: JSON.stringify(
          Object.fromEntries(CHECKLIST_TOPICS.map(([topic, description]) => [topic, description]))
        ),
        createdAt: now,
        updatedAt: now
      }
    ])
    let order = 1
    await queryInterface.bulkInsert('ChecklistItems', CHECKLIST_TOPICS.flatMap(([category, , items]) =>
      items.map(([id, name, textWhenOn, textWhenOff, checkedPoints, uncheckedPoints]) => ({
        id,
        name,
        textWhenOn,
        textWhenOff,
        checkedPoints,
        uncheckedPoints,
        category,
        checklistId: CHECKLIST_ID,
        order: order++
      }))))
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

    const checklists = `(SELECT id FROM "Checklists" WHERE "courseInstanceId" = ${COURSE_ID})`
    const checklistItems = `(SELECT id FROM "ChecklistItems" WHERE "checklistId" IN ${checklists})`
    await query(`DELETE FROM "ReviewChecks" WHERE "checklistItemId" IN ${checklistItems}`)
    await query(`DELETE FROM "ChecklistItems" WHERE "checklistId" IN ${checklists}`)
    await query(`DELETE FROM "Checklists" WHERE "courseInstanceId" = ${COURSE_ID}`)

    await query(`DELETE FROM "StudentInstances" WHERE "courseInstanceId" = ${COURSE_ID}`)
    await query(`DELETE FROM "TeacherInstances" WHERE "courseInstanceId" = ${COURSE_ID}`)
    await query(`DELETE FROM "CourseInstances" WHERE id = ${COURSE_ID}`)
    await query(`DELETE FROM "Users" WHERE id = ${BOUNCING_STUDENT}`)
  }
}
