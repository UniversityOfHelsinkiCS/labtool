'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'StudentInstances',
      [
        {
          id: 10011,
          github: 'http://github.com/tiralabra1',
          projectName: 'Tiran labraprojekti',
          userId: 10011,
          courseInstanceId: 10011,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10012,
          github: 'http://github.com/tiralabra2',
          projectName: 'Tiran toinen labraprojekti',
          userId: 10012,
          courseInstanceId: 10011,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10021,
          github: 'http://github.com/otmprojekti1',
          projectName: 'OTM projekti',
          userId: 10021,
          courseInstanceId: 10012,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10022,
          github: 'http://github.com/otmprojekti1',
          projectName: 'Toinen OTM projekti',
          userId: 10022,
          courseInstanceId: 10012,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10031,
          github: 'http://github.com/superprojekti',
          projectName: 'super projekti',
          userId: 10031,
          courseInstanceId: 10011,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10032,
          github: 'http://github.com/superprojekti',
          projectName: 'super projekti',
          userId: 10031,
          courseInstanceId: 10012,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26'
        },
        {
          id: 10033,
          github: 'http://github.com/superprojekti',
          projectName: 'super projekti',
          userId: 10031,
          courseInstanceId: 10013,
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
