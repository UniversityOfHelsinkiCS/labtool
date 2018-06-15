'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'StudentTags',
      [
        {
          id: 30001,
          studentInstanceId: 10011,
          tagId: 20001,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30002,
          studentInstanceId: 10011,
          tagId: 20002,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30003,
          studentInstanceId: 10011,
          tagId: 20003,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30004,
          studentInstanceId: 10012,
          tagId: 20001,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30005,
          studentInstanceId: 10012,
          tagId: 20005,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30006,
          studentInstanceId: 10021,
          tagId: 20004,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 30007,
          studentInstanceId: 10031,
          tagId: 20007,
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('StudentTags', null, {})
  }
}
