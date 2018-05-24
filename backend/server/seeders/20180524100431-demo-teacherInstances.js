'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'TeacherInstances',
      [
        {
          id: 1,
          userId: 10,
          courseInstanceId: 1,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('TeacherInstances', null, {})
  }
}
