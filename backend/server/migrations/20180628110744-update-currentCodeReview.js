'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.changeColumn('CourseInstances', 'currentCodeReview', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: []
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.changeColumn('CourseInstances', 'currentCodeReview', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    })
  }
}
