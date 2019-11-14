

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Weeks', 'feedback', {
      type: Sequelize.TEXT
    })
    await queryInterface.changeColumn('Weeks', 'instructorNotes', {
      type: Sequelize.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Weeks', 'feedback', {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn('Weeks', 'instructorNotes', {
      type: Sequelize.STRING
    })
  }
}
