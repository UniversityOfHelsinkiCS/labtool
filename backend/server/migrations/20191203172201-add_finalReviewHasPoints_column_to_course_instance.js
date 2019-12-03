'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('CourseInstances', 'finalReviewHasPoints', {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('CourseInstances', 'finalReviewHasPoints')
};
