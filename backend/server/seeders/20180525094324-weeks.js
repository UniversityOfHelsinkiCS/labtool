

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
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10002,
        studentInstanceId: 10011,
        points: 2,
        weekNumber: 2,
        feedback: 'Melko hienoa työtä!',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10003,
        studentInstanceId: 10011,
        points: 3,
        weekNumber: 3,
        feedback: 'Erittäin hienoa työtä!',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10004,
        studentInstanceId: 10011,
        points: 3,
        weekNumber: 4,
        feedback: 'Hyvin menee!',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10011,
        studentInstanceId: 10021,
        points: 1,
        weekNumber: 1,
        feedback: 'Ei mennyt ihan putkeen, mutta toivottavasti ensi viikolla menee paremmin.',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10012,
        studentInstanceId: 10021,
        points: 2,
        weekNumber: 2,
        feedback: 'Oli tämä parempi kuin edellinen viikko, mutta vielä pitäisi parantaa.',
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      }
    ],
    {}
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Weeks', null, {})
}
