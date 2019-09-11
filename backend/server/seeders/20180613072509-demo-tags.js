'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Tags',
      [
        {
          id: 20001,
          name: 'Javascript',
          color: 'red',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20002,
          name: 'HTML',
          color: 'yellow',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20003,
          name: 'game',
          color: 'black',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20004,
          name: 'React',
          color: 'green',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20005,
          name: 'Node.js',
          color: 'blue',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20006,
          name: 'Java',
          color: 'orange',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20007,
          name: 'FORTRAN',
          color: 'pink',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20008,
          name: 'C++',
          color: 'olive',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20009,
          name: 'Python',
          color: 'teal',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20010,
          name: 'Unity',
          color: 'purple',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        },
        {
          id: 20011,
          name: 'DROPPED',
          color: 'grey',
          createdAt: '2018-06-13',
          updatedAt: '2018-06-13'
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Tags', null, {})
  }
}
