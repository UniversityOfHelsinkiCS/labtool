

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Comments', 'notified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
    queryInterface.addColumn('Weeks', 'notified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Comments', 'notified')
    queryInterface.removeColumn('Weeks', 'notified')
  }
}
