

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('StudentInstances', 'valid', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('StudentInstances', 'valid')
  }
}
