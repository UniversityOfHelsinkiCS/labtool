'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('ChecklistItems', 'minimumRequirement', {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('ChecklistItems', 'minimumRequirement')
};
