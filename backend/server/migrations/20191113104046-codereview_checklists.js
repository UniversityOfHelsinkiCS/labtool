module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Checklists', 'codeReviewNumber', {
      type: Sequelize.INTEGER,
      defaultValue: null
    })

    await queryInterface.addColumn('ReviewChecks', 'codeReviewId', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      references: {
        model: 'CodeReviews',
        key: 'id',
        as: 'codeReviewId'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ReviewChecks', 'codeReviewId')

    await queryInterface.removeColumn('Checklists', 'codeReviewNumber')
  }
};
