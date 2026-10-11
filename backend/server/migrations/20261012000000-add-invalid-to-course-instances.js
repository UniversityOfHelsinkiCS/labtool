// A course registered or imported by mistake can be marked invalid (#905): only its staff and sysops see it.
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('CourseInstances', 'invalid', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }),

  down: queryInterface => queryInterface.removeColumn('CourseInstances', 'invalid')
}
