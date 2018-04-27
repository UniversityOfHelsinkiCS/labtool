'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CourseInstances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      start: {
        type: Sequelize.DATE
      },
      end: {
        type: Sequelize.DATE
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      weekAmount: {
        type: Sequelize.INTEGER,
        defaultValue: 7
      },
      weekMaxPoints: {
        type: Sequelize.DOUBLE,
        defaultValue: 2
      },
      currentWeek: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      ohid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CourseInstances')
  }
}
