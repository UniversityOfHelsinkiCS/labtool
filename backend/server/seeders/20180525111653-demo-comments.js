'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Comments',
      [
        {
          id: 10001,
          comment: 'Joo, on ollu vähän kiireitä.',
          hidden: false,
          weekId: 10011,
          from: 'Sanna Makkonen',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10002,
          comment: 'No, sellastahan se on.',
          hidden: false,
          weekId: 10011,
          from: 'Paavo Pietarinen',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10003,
          comment: 'Joo joo, parhaani yritän.',
          hidden: false,
          weekId: 10012,
          from: 'Sanna Makkonen',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Comments', null, {})
  }
}
