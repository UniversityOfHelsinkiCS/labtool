// Additional review notes on a final review, written by course staff other than the assigned instructor,
// who alone edits the review notes of the final review. Never shown to students.
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ReviewNotes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    studentInstanceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: { model: 'StudentInstances', key: 'id' }
    },
    weekNumber: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      onDelete: 'SET NULL',
      references: { model: 'Users', key: 'id' }
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
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

  down: queryInterface => queryInterface.dropTable('ReviewNotes')
}
