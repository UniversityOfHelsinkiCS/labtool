// Descriptions of checklist topics, { topic: description } (issue #525).
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Checklists', 'topicDescriptions', {
    type: Sequelize.JSONB,
    allowNull: true
  }),

  down: queryInterface => queryInterface.removeColumn('Checklists', 'topicDescriptions')
}
