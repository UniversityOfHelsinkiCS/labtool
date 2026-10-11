// Whether students see their final review (points, grade, feedback, comments). New courses hide it until
// the teacher shows it; courses that existed before this setting keep showing it as they did.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('CourseInstances', 'finalReviewVisible', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
    await queryInterface.sequelize.query('UPDATE "CourseInstances" SET "finalReviewVisible" = true')
  },

  down: queryInterface => queryInterface.removeColumn('CourseInstances', 'finalReviewVisible')
}
