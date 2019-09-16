

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('TeacherInstances', 'admin', Sequelize.BOOLEAN, {
    after: 'userId'
  }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('TeacherInstances', 'admin')
}
