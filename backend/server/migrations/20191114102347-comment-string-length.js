

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Comments', 'comment', {
      type: Sequelize.STRING(1000)
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Comments', 'comment', {
      type: Sequelize.STRING
    })
  }
}
