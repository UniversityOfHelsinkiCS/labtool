

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Tags', 'courseInstanceId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'CourseInstances',
        key: 'id',
        as: 'courseInstanceId'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Tags', 'courseInstanceId')
  }
}
