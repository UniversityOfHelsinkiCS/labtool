'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Weeks',
      [
        {
          id: 1,
          studentInstanceId: 11,
          points: 3,
          weekNumber: 1,
          feedback: 'Hienoa työtä!',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 2,
          studentInstanceId: 11,
          points: 2,
          weekNumber: 2,
          feedback: 'Melko hienoa työtä!',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 3,
          studentInstanceId: 11,
          points: 3,
          weekNumber: 3,
          feedback: 'Erittäin hienoa työtä!',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 4,
          studentInstanceId: 11,
          points: 3,
          weekNumber: 4,
          feedback: 'Hyvin menee!',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 11,
          studentInstanceId: 21,
          points: 1,
          weekNumber: 1,
          feedback: 'Ei mennyt ihan putkeen, mutta toivottavasti ensi viikolla menee paremmin.',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 12,
          studentInstanceId: 21,
          points: 2,
          weekNumber: 2,
          feedback: 'Oli tämä parempi kuin edellinen viikko, mutta vielä pitäisi parantaa.',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Weeks', null, {})
  }
}
