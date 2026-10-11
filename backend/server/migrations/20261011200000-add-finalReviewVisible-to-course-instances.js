// Whether students see their final review (points, grade, feedback, comments). Hidden until the teacher
// shows it in the course settings.
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('CourseInstances', 'finalReviewVisible', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }),

  down: queryInterface => queryInterface.removeColumn('CourseInstances', 'finalReviewVisible')
}
