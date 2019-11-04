

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('UPDATE "TeacherInstances" SET "admin" = NOT "admin";')
    await queryInterface.renameColumn('TeacherInstances', 'admin', 'instructor')
    await queryInterface.renameColumn('Users', 'admin', 'teacher')
    await queryInterface.addColumn('Users', 'sysop', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('UPDATE "TeacherInstances" SET "instructor" = NOT "instructor";')
    await queryInterface.renameColumn('TeacherInstances', 'instructor', 'admin')
    await queryInterface.removeColumn('Users', 'sysop')
    await queryInterface.renameColumn('Users', 'teacher', 'admin')
  }
}
