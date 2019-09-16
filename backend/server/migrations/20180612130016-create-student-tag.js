
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('StudentTags', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
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
    tagId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'Tags',
        key: 'id',
        as: 'tagId'
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('StudentTags')
}
