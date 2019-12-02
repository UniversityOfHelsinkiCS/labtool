

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Weeks', 'grade', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('ChecklistItems', 'minimumRequirementMetIf', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    })
    await queryInterface.addColumn('ChecklistItems', 'minimumRequirementGradePenalty', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Weeks', 'grade')
    await queryInterface.removeColumn('ChecklistItems', 'minimumRequirementMetIf')
    await queryInterface.removeColumn('ChecklistItems', 'minimumRequirementGradePenalty')
  }
}
