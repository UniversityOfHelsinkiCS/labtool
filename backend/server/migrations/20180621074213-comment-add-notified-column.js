'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Comments', 'notified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Comments', 'notified')
  }
}
