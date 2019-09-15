
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('StudentInstances', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    github: {
      type: Sequelize.STRING
    },
    projectName: {
      type: Sequelize.STRING
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
    },
    teacherInstanceId: {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      allowNull: true,
      references: {
        model: 'TeacherInstances',
        key: 'id',
        as: 'teacherInstanceId'
      }
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('StudentInstances')
}
