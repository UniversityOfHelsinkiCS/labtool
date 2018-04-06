module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Users', 'studentnumber', 'studentNumber')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('Users', 'studentNumber', 'studentnumber')
  }
}
