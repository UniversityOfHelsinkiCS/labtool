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
          admin: true,
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
        },
        {
          id: 10101,
          userId: 10101,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10102,
          userId: 10102,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10103,
          userId: 10103,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10104,
          userId: 10104,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10105,
          userId: 10105,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10106,
          userId: 10106,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10107,
          userId: 10107,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10108,
          userId: 10108,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10109,
          userId: 10109,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        },
        {
          id: 10110,
          userId: 10110,
          courseInstanceId: 10012,
          admin: false,
          createdAt: '1970-01-01',
          updatedAt: '1970-01-01'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('TeacherInstances', null, {})
  }
}
