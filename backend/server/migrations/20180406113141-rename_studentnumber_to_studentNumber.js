module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameColumn('Users', 'studentnumber', 'studentNumber'),

  down: (queryInterface, Sequelize) => queryInterface.renameColumn('Users', 'studentNumber', 'studentnumber')
}
