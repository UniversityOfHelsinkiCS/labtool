// Descriptions ("kuvaus") belong to checklist items, not to topics (#525).
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ChecklistItems', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    })
    await queryInterface.removeColumn('Checklists', 'topicDescriptions')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Checklists', 'topicDescriptions', {
      type: Sequelize.JSONB,
      allowNull: true
    })
    await queryInterface.removeColumn('ChecklistItems', 'description')
  }
}
