

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'admin', Sequelize.BOOLEAN, {
    after: 'studentnumber'
  }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'admin')
}
