

module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn('CourseInstances', 'coursesPage', {
      type: Sequelize.STRING
    }),
    queryInterface.addColumn('CourseInstances', 'courseMaterial', {
      type: Sequelize.STRING
    })
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.removeColumn('CourseInstances', 'coursesPage'),
    queryInterface.removeColumn('CourseInstances', 'courseMaterial')
  ])
}
