'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('TeacherInstances', 'admin', Sequelize.BOOLEAN, {
      after: 'userId'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('TeacherInstances', 'admin')
  }
}
