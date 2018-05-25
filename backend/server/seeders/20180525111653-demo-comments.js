'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Comments',
      [
        {
          id: 1,
          comment: 'Joo, on ollu vähän kiireitä.',
          hidden: false,
          weekId: 11,
          from: 'Sanna Makkonen',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 2,
          comment: 'No, sellastahan se on.',
          hidden: false,
          weekId: 11,
          from: 'Paavo Pietarinen',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 3,
          comment: 'Joo joo, parhaani yritän.',
          hidden: false,
          weekId: 12,
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
