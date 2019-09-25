
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('WeekDrafts', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    weekNumber: {
      type: Sequelize.INTEGER
    },
    data: {
      type: Sequelize.JSONB
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
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('WeekDrafts')
}
