// Student username format is {course}opiskelija{n} where course = {tira, otm} and n = {1, 2, 3, 4}
// n = {1, 2, 3} from each course have registered to the course at WebOodi
// n = {1, 2} have already registered on Labtool and n = {1} has points from weeks and comments
// n = {3} has not registered on Labtool and has not set an email address
// n = {4} has not registered to the course and should not be able to register on Labtool
// Assistant teacher username format is {course}ohjaaja where course = {tira, otm}
// User paaopettaja is admin and teacher for all courses
// Course tsoha has been imported to Labtool but there are no registered students yet
// Course tilpe has not been imported yet

'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 10,
          username: 'paaopettaja',
          firsts: 'Pää',
          lastname: 'Opettaja',
          email: 'paa.opettaja@helsinki.fi',
          studentNumber: '014822548',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: true
        },
        {
          id: 11,
          username: 'tiraopiskelija1',
          firsts: 'Maarit Mirja',
          lastname: 'Opiskelija',
          email: 'maarit.opiskelija@helsinki.fi',
          studentNumber: '014578343',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 12,
          username: 'tiraopiskelija2',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          email: 'johan.studerande@helsinki.fi',
          studentNumber: '014553242',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 15,
          username: 'tiraohjaaja',
          firsts: 'Ossi Ohjaaja',
          lastname: 'Mutikainen',
          email: 'ossi.mutikainen@helsinki.fi',
          studentNumber: '013245662',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 21,
          username: 'otmopiskelija1',
          firsts: 'Sanna Sofia',
          lastname: 'Makkonen',
          email: 'sanna.makkonen@helsinki.fi',
          studentNumber: '014893873',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 22,
          username: 'otmopiskelija2',
          firsts: 'Jari Juhani',
          lastname: 'Jokinen',
          studentNumber: '014872455',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        },
        {
          id: 25,
          username: 'otmohjaaja',
          firsts: 'Paavo Matti',
          lastname: 'Pietarinen',
          email: 'paavo.pietarinen@helsinki.fi',
          studentNumber: '012441578',
          createdAt: '2018-03-26',
          updatedAt: '2018-03-26',
          admin: false
        }
      ],
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
