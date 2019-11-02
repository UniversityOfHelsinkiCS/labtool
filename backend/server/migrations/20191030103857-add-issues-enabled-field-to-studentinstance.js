

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StudentInstances', 'issuesDisabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: null
    })
    await queryInterface.addColumn('StudentInstances', 'issuesDisabledCheckedAt', {
      type: Sequelize.DATE,
      defaultValue: null
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StudentInstances', 'issuesDisabled')
    await queryInterface.removeColumn('StudentInstances', 'issuesDisabledCheckedAt')
  }
}
