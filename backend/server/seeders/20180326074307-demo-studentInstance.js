'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return ('StudentInstances', [{
      userId: 1,
      courseInstanceId: 1,
      github: 'http://githubbeli.com/brojekti',
      projectName: 'rojekti'

    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('StudentInstances', null, {})
  }
}
