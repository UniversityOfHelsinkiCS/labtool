module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Comments', 'isReadByInstructor', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Comments', 'isReadByInstructor')
  }
}
