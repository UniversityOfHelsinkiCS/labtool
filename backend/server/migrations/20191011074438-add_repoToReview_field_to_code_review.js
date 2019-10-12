'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('CodeReviews', 'repoToReview', {
      type: Sequelize.STRING
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('CodeReviews', 'repoToReview')
  }
}
