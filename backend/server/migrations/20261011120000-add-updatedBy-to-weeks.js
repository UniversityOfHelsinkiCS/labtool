// Who saved a week review last (issue #1127): shown when someone else saved the review after you
// opened it. Also a first step towards the grading audit log (#1129).
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Weeks', 'updatedBy', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
    onDelete: 'SET NULL'
  }),

  down: queryInterface => queryInterface.removeColumn('Weeks', 'updatedBy')
}
