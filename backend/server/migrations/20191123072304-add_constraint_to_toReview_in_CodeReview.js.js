
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('CodeReviews', ['toReview'], {
        type: 'foreign key',
        name: 'toReviews',
        references: {
          table: 'StudentInstances',
          field: 'id'
        },
        onDelete: 'cascade'
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('CodeReviews', 'toReviews')
  }
}
