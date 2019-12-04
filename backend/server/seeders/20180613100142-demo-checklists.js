

module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([queryInterface.bulkInsert('Checklists', [
    {
      id: 10001,
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26',
      week: 1,
      forCodeReview: false,
      courseInstanceId: 10013,
      master: false
    },
    {
      id: 10002,
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26',
      week: 1,
      forCodeReview: false,
      courseInstanceId: 10011,
      master: false
    },
    {
      id: 10003,
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26',
      week: null,
      forCodeReview: true,
      courseInstanceId: 10011,
      master: false
    }
  ]), queryInterface.bulkInsert('ChecklistItems', [
    {
      id: 1,
      name: 'Readme',
      textWhenOn: 'README kunnossa',
      textWhenOff: 'README puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10001,
      order: 1
    },
    {
      id: 2,
      name: 'Tuntikirjanpito',
      textWhenOn: 'Tuntikirjanpito täytetty oikein',
      textWhenOff: 'Tuntikirjanpito puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10001,
      order: 2
    },
    {
      id: 3,
      name: 'Tietokantakaavio',
      textWhenOn: 'Tietokantakaavio luotu',
      textWhenOff: 'Tietokantakaavio puuttuu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001,
      order: 3
    },
    {
      id: 4,
      name: 'Tietokanta luotu',
      textWhenOn: 'Tietokanta luotu',
      textWhenOff: 'Tietokantaa ei luotu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001,
      order: 4
    },
    {
      id: 5,
      name: 'Tietokannassa dataa',
      textWhenOn: 'Tietokanta sisältää dataa',
      textWhenOff: 'Tietokannassa ei dataa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001,
      order: 5
    },
    {
      id: 6,
      name: 'Koodin laatu',
      textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
      textWhenOff: 'Koodin laadussa parantamisen varaa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Koodi',
      checklistId: 10001,
      order: 6
    },
    {
      id: 7,
      name: 'Readme',
      textWhenOn: 'README kunnossa',
      textWhenOff: 'README puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10002,
      order: 1
    },
    {
      id: 8,
      name: 'Tuntikirjanpito',
      textWhenOn: 'Tuntikirjanpito täytetty oikein',
      textWhenOff: 'Tuntikirjanpito puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10002,
      order: 2
    },
    {
      id: 9,
      name: 'Algoritmin runko',
      textWhenOn: 'Algoritmin runko luotu',
      textWhenOff: 'Algoritmin runko puuttuu',
      checkedPoints: 1,
      uncheckedPoints: 0,
      category: 'Algoritmit',
      checklistId: 10002,
      order: 3
    },
    {
      id: 10,
      name: 'Tietorakenteita luotu',
      textWhenOn: 'Tietorakenteita luotu',
      textWhenOff: 'Tietorakenteita ei ole luotu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Algoritmit',
      checklistId: 10002,
      order: 4
    },
    {
      id: 11,
      name: 'Koodin laatu',
      textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
      textWhenOff: 'Koodin laadussa parantamisen varaa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Koodi',
      checklistId: 10002,
      order: 5
    },
    {
      id: 14,
      name: 'Linkit',
      textWhenOn: 'README:ssa on tarvittavat linkit',
      textWhenOff: 'README:sta puuttuu linkit',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Readme',
      checklistId: 10002,
      prerequisite: 7,
      order: 6
    },
    {
      id: 12,
      name: 'Rakentava palaute',
      textWhenOn: 'Palaute rakentavaa',
      textWhenOff: 'Rakentava palaute puuttuu',
      checkedPoints: 1,
      uncheckedPoints: 0,
      category: 'Katselmointi',
      checklistId: 10003
    },
    {
      id: 13,
      name: 'Koodi selattu',
      textWhenOn: 'Koodia on katsottu',
      textWhenOff: 'Koodia ei katsottu',
      checkedPoints: 1,
      uncheckedPoints: 0,
      category: 'Katselmointi',
      checklistId: 10003
    }
  ])]),

  down: (queryInterface, Sequelize) => Promise.all([queryInterface.bulkDelete('Checklists', null, {}), queryInterface.bulkDelete('ChecklistItems', null, {})])
}
