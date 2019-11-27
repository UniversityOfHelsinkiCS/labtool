module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ChecklistItems', 'prerequisite', {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      allowNull: true,
      references: {
        model: 'ChecklistItems',
        key: 'id',
        as: 'prerequisite'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ChecklistItems', 'prerequisite')
  }
};
