'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'CourseInstances',
      [
        {
          id: 1,
          name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
          start: '2018-03-11T21:00:00.000Z',
          end: '2018-04-29T21:00:00.000Z',
          active: false,
          weekAmount: 7,
          weekMaxPoints: 3,
          currentWeek: 1,
          ohid: 'TIRA',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 2,
          name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
          start: '2018-01-16T21:00:00.000Z',
          end: '2018-03-10T21:00:00.000Z',
          active: false,
          weekAmount: 7,
          weekMaxPoints: 3,
          currentWeek: 1,
          ohid: 'TSOHA',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 3,
          name: 'Ohjelmistotekniikan menetelmät',
          start: '2018-03-11T21:00:00.000Z',
          end: '2018-04-29T21:00:00.000Z',
          active: false,
          weekAmount: 7,
          weekMaxPoints: 3,
          currentWeek: 1,
          ohid: 'OTM',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CourseInstances', null, {})
  }
}
