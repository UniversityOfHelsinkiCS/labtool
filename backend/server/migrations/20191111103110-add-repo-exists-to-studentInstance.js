

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StudentInstances', 'repoExists', {
      type: Sequelize.BOOLEAN,
      defaultValue: null
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StudentInstances', 'repoExists')
  }
}
