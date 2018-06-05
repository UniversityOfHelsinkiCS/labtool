'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'CodeReviews',
      [
        {
          id: 1,
          points: null,
          reviewNumber: 1,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10011,
          toReview: 10012
        },
        {
          id: 2,
          points: null,
          reviewNumber: 1,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10012,
          toReview: 10011
        },
        {
          id: 3,
          points: null,
          reviewNumber: 1,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10021,
          toReview: 10022
        },
        {
          id: 4,
          points: null,
          reviewNumber: 1,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10022,
          toReview: 10021
        },
        {
          id: 5,
          points: null,
          reviewNumber: 2,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10011,
          toReview: 10031
        },
        {
          id: 6,
          points: null,
          reviewNumber: 2,
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          studentInstanceId: 10031,
          toReview: 10031
        }
      ],
      {}
    )
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CodeReviews', null, {})

    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
}
