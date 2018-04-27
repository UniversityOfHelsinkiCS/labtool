module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'studentnumber', Sequelize.STRING, {
      after: 'username'
    })
  },

  down: (queryInterface, Sequelize) => {
    // should not need any returns ?

    return queryInterface.removeColumn('Users', 'studentnumber')

    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
}
