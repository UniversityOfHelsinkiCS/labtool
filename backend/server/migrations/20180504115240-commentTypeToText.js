

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Comments', 'comment', {
        type: 'TEXT USING CAST("comment" as TEXT)'
      }),
      queryInterface.changeColumn('Weeks', 'feedback', {
        type: 'TEXT USING CAST("feedback" as TEXT)'
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Comments', 'comment', {
        type: 'STRING USING CAST("comment" as STRING)'
      }),
      queryInterface.changeColumn('Weeks', 'feedback', {
        type: 'STRING USING CAST("feedback" as STRING)'
      })
    ])
  }
}
