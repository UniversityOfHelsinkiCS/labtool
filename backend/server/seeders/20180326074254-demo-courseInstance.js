'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'CourseInstances',
      [
        {
          id: 10011,
          name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
          start: '2018-03-11T21:00:00.000Z',
          end: '2018-04-29T21:00:00.000Z',
          active: true,
          weekAmount: 7,
          weekMaxPoints: 3,
          finalReview: true,
          currentWeek: 1,
          ohid: 'TKT20010.2018.K.A.1',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10012,
          name: 'Ohjelmistotekniikan menetelmät',
          start: '2018-03-11T21:00:00.000Z',
          end: '2018-04-29T21:00:00.000Z',
          active: true,
          weekAmount: 7,
          weekMaxPoints: 3,
          finalReview: false,
          currentWeek: 1,
          ohid: 'TKT20002.2018.K.K.1',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10013,
          name: 'Aineopintojen harjoitustyö: Tietokantasovellus',
          start: '2018-01-16T21:00:00.000Z',
          end: '2018-03-10T21:00:00.000Z',
          active: false,
          weekAmount: 7,
          weekMaxPoints: 3,
          finalReview: true,
          currentWeek: 1,
          ohid: 'TKT20011.2018.K.A.1',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CourseInstances', null, {})
  }
}
