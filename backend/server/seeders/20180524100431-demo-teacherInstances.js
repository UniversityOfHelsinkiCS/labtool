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
        },
        {
          id: 2,
          userId: 10,
          courseInstanceId: 2,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 3,
          userId: 10,
          courseInstanceId: 3,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 11,
          userId: 15,
          courseInstanceId: 1,
          admin: true,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 12,
          userId: 25,
          courseInstanceId: 2,
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
