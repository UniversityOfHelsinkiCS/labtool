module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Checklists', 'forCodeReview', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.sequelize.query('UPDATE "Checklists" SET "forCodeReview" = TRUE WHERE "codeReviewNumber" = 1')
    await queryInterface.sequelize.query('DELETE FROM "Checklists" WHERE "codeReviewNumber" > 1')
    await queryInterface.removeColumn('Checklists', 'codeReviewNumber')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Checklists', 'codeReviewNumber', {
      type: Sequelize.INTEGER,
      defaultValue: null
    })
    await queryInterface.sequelize.query('UPDATE "Checklists" SET "codeReviewNumber" = 1 WHERE "forCodeReview" = TRUE')
    await queryInterface.removeColumn('Checklists', 'forCodeReview')
  }
};
