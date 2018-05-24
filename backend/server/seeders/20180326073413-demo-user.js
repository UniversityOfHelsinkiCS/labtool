'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 10,
          username: 'paaopettaja',
          firsts: 'Pää',
          lastname: 'Opettaja',
          email: 'paa.opettaja@helsinki.fi',
          studentNumber: '014822548',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: true
        },
        {
          id: 11,
          username: 'opiskelija1',
          firsts: 'Pekka Matti',
          lastname: 'Opiskelija',
          email: 'pekka.opiskelija@helsinki.fi',
          studentNumber: '014578343',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 12,
          username: 'opiskelija2',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          email: 'pekka.opiskelija@helsinki.fi',
          studentNumber: '014553242',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 13,
          username: 'ohjaavaopiskelija',
          firsts: 'Ossi Ohjaaja',
          lastname: 'Mutikainen',
          email: 'ossi.mutikainen@helsinki.fi',
          studentNumber: '013245662',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: true
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
