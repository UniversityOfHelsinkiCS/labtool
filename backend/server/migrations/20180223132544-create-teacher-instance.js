
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TeacherInstances', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
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
    userId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Users',
        key: 'id',
        as: 'userId'
      }
    },
    courseInstanceId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'CourseInstances',
        key: 'id',
        as: 'courseInstanceId'
      }
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('TeacherInstances')
}
