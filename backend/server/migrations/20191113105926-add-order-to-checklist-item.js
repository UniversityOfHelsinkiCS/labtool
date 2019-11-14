module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ChecklistItems', 'order', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ChecklistItems', 'order')
  }
}
