// Final review results are hidden from students by default, also on courses that existed before the
// setting (an earlier version of 20261011200000 showed them there). Teachers show them in the course
// settings.
module.exports = {
  up: queryInterface => queryInterface.sequelize.query('UPDATE "CourseInstances" SET "finalReviewVisible" = false'),

  // which courses showed their final review before cannot be known
  down: async () => {}
}
