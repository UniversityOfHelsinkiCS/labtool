

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Weeks', 'instructorNotes', {
    type: Sequelize.STRING,
    defaultValue: ''
  }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Weeks', 'instructorNotes')
}
