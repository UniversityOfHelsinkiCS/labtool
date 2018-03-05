'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    queryInterface.addColumn('Users', 'studentNumber', Sequelize.STRING, {
      after: 'username'
    });

  },

  down: (queryInterface, Sequelize) => {
    // should not need any returns ?
    
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
