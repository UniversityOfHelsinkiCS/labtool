
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Weeks', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    points: {
      type: Sequelize.DOUBLE
    },
    weekNumber: {
      type: Sequelize.INTEGER
    },
    feedback: {
      type: Sequelize.STRING
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Weeks')
}
