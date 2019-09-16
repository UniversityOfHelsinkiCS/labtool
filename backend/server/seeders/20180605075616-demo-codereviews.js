

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'CodeReviews',
    [
      {
        id: 10001,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10011,
        toReview: 10012
      },
      {
        id: 10002,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10012,
        toReview: 10031
      },
      {
        id: 10003,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10031,
        toReview: 10011
      },
      {
        id: 10004,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10021,
        toReview: 10022
      },
      {
        id: 10005,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10022,
        toReview: 10032
      },
      {
        id: 10006,
        points: null,
        reviewNumber: 1,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10032,
        toReview: 10021
      },
      {
        id: 10007,
        points: null,
        reviewNumber: 2,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10011,
        toReview: 10031
      },
      {
        id: 10008,
        points: null,
        reviewNumber: 2,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10031,
        toReview: 10012
      },
      {
        id: 10009,
        points: null,
        reviewNumber: 2,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        studentInstanceId: 10012,
        toReview: 10011
      }
    ],
    {}
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('CodeReviews', null, {})
}
