'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return (
      'StudentInstances',
      [
        {
          id: 1,
          github: 'http://github.com/tiralabra1',
          projectName: 'Tiran labraprojekti',
          userId: 11,
          courseInstanceId: 1
        },
        {
          id: 2,
          github: 'http://github.com/tiralabra2',
          projectName: 'Toinen tiran labraprojekti',
          userId: 12,
          courseInstanceId: 1
        }
      ]
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('StudentInstances', null, {})
  }
}
