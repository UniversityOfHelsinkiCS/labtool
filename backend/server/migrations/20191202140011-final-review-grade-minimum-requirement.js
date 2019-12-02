'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Weeks', 'grade', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addColumn('ChecklistItems', 'minimumRequirementMetIf', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('ChecklistItems', 'minimumRequirementGradePenalty', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Weeks', 'grade')
    await queryInterface.removeColumn('ChecklistItems', 'minimumRequirementMetIf')
    await queryInterface.removeColumn('ChecklistItems', 'minimumRequirementGradePenalty')
  }
};
