// Change history for grading (#1129) and student repository links (#1132), and the repository a code
// review was assigned / done against, so later repository changes do not move past code reviews.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ChangeLogs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      courseInstanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'CourseInstances', key: 'id' },
        onDelete: 'CASCADE'
      },
      studentInstanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'StudentInstances', key: 'id' },
        onDelete: 'CASCADE'
      },
      // who made the change
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'SET NULL'
      },
      // week_review | code_review_grade | repository
      kind: { type: Sequelize.STRING, allowNull: false },
      // week number or code review round, null for repository changes
      number: { type: Sequelize.INTEGER, allowNull: true },
      // { field: { from, to } }, checklist: [{ id, name, from, to }]
      changes: { type: Sequelize.JSONB, allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    })
    await queryInterface.addIndex('ChangeLogs', ['studentInstanceId'])
    await queryInterface.addColumn('CodeReviews', 'repoAtAssignment', { type: Sequelize.STRING, allowNull: true })
    await queryInterface.addColumn('CodeReviews', 'repoAtLinkAdded', { type: Sequelize.STRING, allowNull: true })
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('CodeReviews', 'repoAtLinkAdded')
    await queryInterface.removeColumn('CodeReviews', 'repoAtAssignment')
    await queryInterface.dropTable('ChangeLogs')
  }
}
