module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Checklists', {
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
    week: {
      type: Sequelize.INTEGER
    },
    list: {
      type: Sequelize.JSONB
    },
    courseName: {
      type: Sequelize.STRING
    },
    courseInstanceId: {
      type: Sequelize.INTEGER,
      onDelelete: 'CASCADE',
      references: {
        model: 'CourseInstances',
        key: 'id',
        as: 'courseInstanceId'
      }
    },
    master: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Checklists')
}
