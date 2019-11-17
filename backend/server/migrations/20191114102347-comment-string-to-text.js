

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Comments', 'comment', {
      type: Sequelize.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Comments', 'comment', {
      type: Sequelize.STRING
    })
  }
}
