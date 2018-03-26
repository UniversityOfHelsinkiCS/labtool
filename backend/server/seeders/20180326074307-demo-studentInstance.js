'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return ('StudentInstances', [{
      userId: 1,
      courseInstanceId: 1,
      github: 'githubbeli',
      projectName: 'rojekti'

    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('StudentInstances', null, {});
  }
};
