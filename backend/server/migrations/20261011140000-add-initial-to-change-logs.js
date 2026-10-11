// Marks the first entry of a review, grading or repository as the initial version instead of a
// change from empty (#1129, #1132).
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('ChangeLogs', 'initial', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }),

  down: queryInterface => queryInterface.removeColumn('ChangeLogs', 'initial')
}
