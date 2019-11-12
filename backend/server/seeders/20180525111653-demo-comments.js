

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'Comments',
    [
      {
        id: 10001,
        comment: 'Joo, on ollu vähän kiireitä.',
        hidden: false,
        weekId: 10011,
        from: 'Sanna Makkonen',
        userId: 10021,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        isRead: [10002, 10025]
      },
      {
        id: 10002,
        comment: 'No, sellastahan se on.',
        hidden: false,
        weekId: 10011,
        from: 'Paavo Pietarinen',
        userId: 10025,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        isRead: [10002, 10025]
      },
      {
        id: 10003,
        comment: 'Joo joo, parhaani yritän.',
        hidden: false,
        weekId: 10012,
        from: 'Sanna Makkonen',
        userId: 10021,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        isRead: [10002, 10025]
      }
    ],
    {}
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Comments', null, {})
}
