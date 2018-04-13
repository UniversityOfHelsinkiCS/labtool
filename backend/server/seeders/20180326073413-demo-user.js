'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      username: 'peraper',
      firsts: 'Pera',
      lastname: 'Perälä',
      email: 'demo@demo.com',
      studentnumber: '014555555',
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26'
    }], {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}


