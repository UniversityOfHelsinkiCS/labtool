'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Checklists', 'maxPoints', {
      type: Sequelize.DOUBLE
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Checklists', 'maxPoints')
  }
};
