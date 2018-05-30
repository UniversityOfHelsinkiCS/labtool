'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'AssistantInstances',
      [
        {
          id: 10011,
          teacherInstanceId: 10001,
          studentInstanceId: 10011,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('AssistantInstances', null, {})
  }
}
