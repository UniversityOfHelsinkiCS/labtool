

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('StudentInstances', 'dropped', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('StudentInstances', 'dropped')
  }
}
