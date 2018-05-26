'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'StudentInstances',
      [
        {
          id: 11,
          github: 'http://github.com/tiralabra1',
          projectName: 'Tiran labraprojekti',
          userId: 11,
          courseInstanceId: 11,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 12,
          github: 'http://github.com/tiralabra2',
          projectName: 'Tiran toinen labraprojekti',
          userId: 12,
          courseInstanceId: 11,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 21,
          github: 'http://github.com/otmprojekti1',
          projectName: 'OTM projekti',
          userId: 21,
          courseInstanceId: 12,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 22,
          github: 'http://github.com/otmprojekti1',
          projectName: 'Toinen OTM projekti',
          userId: 22,
          courseInstanceId: 12,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('StudentInstances', null, {})
  }
}
