'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'TeacherInstances',
      [
        {
          id: 10001,
          userId: 10010,
          courseInstanceId: 10011,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10002,
          userId: 10010,
          courseInstanceId: 10012,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10003,
          userId: 10010,
          courseInstanceId: 10013,
          admin: false,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10011,
          userId: 10015,
          courseInstanceId: 10011,
          admin: false,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10012,
          userId: 10025,
          courseInstanceId: 10012,
          admin: false,
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
