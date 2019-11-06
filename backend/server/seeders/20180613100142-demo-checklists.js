

module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([queryInterface.bulkInsert('Checklists', [
    {
      id: 10001,
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26',
      week: 1,
      courseInstanceId: 10013,
      master: false
    },
    {
      id: 10002,
      createdAt: '2018-03-26',
      updatedAt: '2018-03-26',
      week: 1,
      courseInstanceId: 10011,
      master: false
    }
  ]), queryInterface.bulkInsert('ChecklistItems', [
    {
      name: 'Readme',
      textWhenOn: 'README kunnossa',
      textWhenOff: 'README puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10001
    },
    {
      name: 'Tuntikirjanpito',
      textWhenOn: 'Tuntikirjanpito täytetty oikein',
      textWhenOff: 'Tuntikirjanpito puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10001
    },
    {
      name: 'Tietokantakaavio',
      textWhenOn: 'Tietokantakaavio luotu',
      textWhenOff: 'Tietokantakaavio puuttuu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001
    },
    {
      name: 'Tietokanta luotu',
      textWhenOn: 'Tietokanta luotu',
      textWhenOff: 'Tietokantaa ei luotu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001
    },
    {
      name: 'Tietokannassa dataa',
      textWhenOn: 'Tietokanta sisältää dataa',
      textWhenOff: 'Tietokannassa ei dataa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Tietokanta',
      checklistId: 10001
    },
    {
      name: 'Koodin laatu',
      textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
      textWhenOff: 'Koodin laadussa parantamisen varaa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Koodi',
      checklistId: 10001
    },
    {
      name: 'Readme',
      textWhenOn: 'README kunnossa',
      textWhenOff: 'README puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10002
    },
    {
      name: 'Tuntikirjanpito',
      textWhenOn: 'Tuntikirjanpito täytetty oikein',
      textWhenOff: 'Tuntikirjanpito puuttuu',
      checkedPoints: 0,
      uncheckedPoints: -0.5,
      category: 'Dokumentaatio',
      checklistId: 10002
    },
    {
      name: 'Algoritmin runko',
      textWhenOn: 'Algoritmin runko luotu',
      textWhenOff: 'Algoritmin runko puuttuu',
      checkedPoints: 1,
      uncheckedPoints: 0,
      category: 'Algoritmit',
      checklistId: 10002
    },
    {
      name: 'Tietorakenteita luotu',
      textWhenOn: 'Tietorakenteita luotu',
      textWhenOff: 'Tietorakenteita ei ole luotu',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Algoritmit',
      checklistId: 10002
    },
    {
      name: 'Koodin laatu',
      textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
      textWhenOff: 'Koodin laadussa parantamisen varaa',
      checkedPoints: 0.5,
      uncheckedPoints: 0,
      category: 'Koodi',
      checklistId: 10002
    }
  ])]),

  down: (queryInterface, Sequelize) => Promise.all([queryInterface.bulkDelete('Checklists', null, {}), queryInterface.bulkDelete('ChecklistItems', null, {})])
}
