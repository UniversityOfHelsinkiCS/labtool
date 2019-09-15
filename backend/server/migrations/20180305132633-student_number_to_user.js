module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'studentnumber', Sequelize.STRING, {
    after: 'username'
  }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Users', 'studentnumber')

  /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */

}
