'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CodeReviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      points: {
        type: Sequelize.DOUBLE
      },
      reviewNumber: {
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
      },
      toReview: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'StudentInstances',
          key: 'id',
          as: 'toReview'
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CodeReviews')
  }
}
