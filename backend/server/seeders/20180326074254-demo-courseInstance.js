'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('CourseInstances', [{
      name: 'hassuKurssi',
      ohid: 'TKT5555',
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26'
    }], {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CourseInstances', null, {})
  }
}
