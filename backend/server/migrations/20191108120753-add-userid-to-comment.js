

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Comments', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null // we cannot easily map existing comments, just use null
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Comments', 'userId')
  }
}
