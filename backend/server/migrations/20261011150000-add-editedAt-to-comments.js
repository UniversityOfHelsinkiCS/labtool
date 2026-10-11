// When a comment's text was last edited by its author (issue #534).
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Comments', 'editedAt', {
    type: Sequelize.DATE,
    allowNull: true
  }),

  down: queryInterface => queryInterface.removeColumn('Comments', 'editedAt')
}
