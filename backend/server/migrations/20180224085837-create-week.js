'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Weeks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      points: {
        type: Sequelize.INTEGER
      },
      weekNumber: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      studentInstanceId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'StudentInstances',
          key: 'id',
          as: 'studentInstanceId'
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Weeks')
  }
}
