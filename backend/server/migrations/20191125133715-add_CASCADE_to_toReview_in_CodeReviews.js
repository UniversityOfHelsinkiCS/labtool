module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CodeReviews', 'CodeReviews_toReview_fkey')
    await queryInterface.addConstraint('CodeReviews', ['toReview'], {
      type: 'foreign key',
      references: {
        table: 'StudentInstances',
        field: 'id'
      },
      onDelete: 'CASCADE'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CodeReviews', 'CodeReviews_toReview_fkey')
    await queryInterface.addConstraint('CodeReviews', ['toReview'], {
      type: 'foreign key',
      references: {
        table: 'StudentInstances',
        field: 'id'
      }
    })
  }
}
