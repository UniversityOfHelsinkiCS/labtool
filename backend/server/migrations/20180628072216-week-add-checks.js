

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Weeks', 'checks', {
    type: Sequelize.JSONB,
    defaultValue: {}
  }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Weeks', 'checks')
}
