

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Weeks',
    [
      {
        id: 10001,
        studentInstanceId: 10011,
        points: 3,
        weekNumber: 1,
        feedback: 'Hienoa työtä!',
        instructorNotes: '',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10002,
        studentInstanceId: 10011,
        points: 2,
        weekNumber: 2,
        feedback: 'Melko hienoa työtä!',
        instructorNotes: 'en antanut täysiä pisteitä, koska READMEssa ja muussa dokumentaatiossa on parantamisen varaa.',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10003,
        studentInstanceId: 10011,
        points: 3,
        weekNumber: 3,
        feedback: 'Erittäin hienoa työtä!',
        instructorNotes: '',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10004,
        studentInstanceId: 10011,
        points: 3,
        weekNumber: 4,
        feedback: 'Hyvin menee!',
        instructorNotes: '',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10011,
        studentInstanceId: 10021,
        points: 1,
        weekNumber: 1,
        feedback: 'Ei mennyt ihan putkeen, mutta toivottavasti ensi viikolla menee paremmin.',
        instructorNotes: 'Useita ongelmia koodissa ja dokumentaatiossa, README puuttuu',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10012,
        studentInstanceId: 10021,
        points: 2,
        weekNumber: 2,
        feedback: 'Oli tämä parempi kuin edellinen viikko, mutta vielä pitäisi parantaa.',
        instructorNotes: 'vaatimusmäärittelyssä vieläkin ongelmia',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      }
    ],
    {}
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Weeks', null, {})
}
