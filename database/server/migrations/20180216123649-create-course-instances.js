
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('course_instances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      start: {
        allowNull: false,
        type: Sequelize.DATE
      },
      end: {
        allowNull: false,
        type: Sequelize.DATE
      },
      active: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      week_amount: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      week_max_points: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      current_week: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('course_instances');
  }
};