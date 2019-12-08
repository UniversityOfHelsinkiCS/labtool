

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('StudentInstances', 'validRegistration', {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('StudentInstances', 'validRegistration')
}
