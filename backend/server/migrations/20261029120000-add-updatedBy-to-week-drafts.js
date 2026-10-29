// Who saved a week review draft last (#1127): shown when someone else saved the draft after you opened it.
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('WeekDrafts', 'updatedBy', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
    onDelete: 'SET NULL'
  }),

  down: queryInterface => queryInterface.removeColumn('WeekDrafts', 'updatedBy')
}
