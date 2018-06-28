'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Checklists', [
      {
        id: 10001,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        week: 1,
        list: JSON.stringify({
          Dokumentaatio: [
            {
              name: 'Readme',
              textWhenOn: 'README kunnossa',
              textWhenOff: 'README puuttuu',
              checkedPoints: 0,
              uncheckedPoints: -0.5
            },
            {
              name: 'Tuntikirjanpito',
              textWhenOn: 'Tuntikirjanpito täytetty oikein',
              textWhenOff: 'Tuntikirjanpito puuttuu',
              checkedPoints: 0,
              uncheckedPoints: -0.5
            }
          ],
          Tietokanta: [
            {
              name: 'Tietokantakaavio',
              textWhenOn: 'Tietokantakaavio luotu',
              textWhenOff: 'Tietokantakaavio puuttuu',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            },
            {
              name: 'Tietokanta luotu',
              textWhenOn: 'Tietokanta luotu',
              textWhenOff: 'Tietokantaa ei luotu',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            },
            {
              name: 'Tietokannassa dataa',
              textWhenOn: 'Tietokanta sisältää dataa',
              textWhenOff: 'Tietokannassa ei dataa',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            }
          ],
          Koodi: [
            {
              name: 'Koodin laatu',
              textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
              textWhenOff: 'Koodin laadussa parantamisen varaa',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            }
          ]
        }),
        courseName: 'Aineopintojen harjoitustyö: Tietokantasovellus',
        courseInstanceId: 10013,
        master: false
      },
      {
        id: 10002,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26',
        week: 1,
        list: JSON.stringify({
          Dokumentaatio: [
            {
              name: 'Readme',
              textWhenOn: 'README kunnossa',
              textWhenOff: 'README puuttuu',
              checkedPoints: 0,
              uncheckedPoints: -0.5
            },
            {
              name: 'Tuntikirjanpito',
              textWhenOn: 'Tuntikirjanpito täytetty oikein',
              textWhenOff: 'Tuntikirjanpito puuttuu',
              checkedPoints: 0,
              uncheckedPoints: -0.5
            }
          ],
          Algoritmit: [
            {
              name: 'Algoritmin runko',
              textWhenOn: 'Algoritmin runko luotu',
              textWhenOff: 'Algoritmin runko puuttuu',
              checkedPoints: 1,
              uncheckedPoints: 0
            },
            {
              name: 'Tietorakenteita luotu',
              textWhenOn: 'Tietorakenteita luotu',
              textWhenOff: 'Tietorakenteita ei ole luotu',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            }
          ],
          Koodi: [
            {
              name: 'Koodin laatu',
              textWhenOn: 'Koodi tehty laadukkaasti ja sisältää kommentteja',
              textWhenOff: 'Koodin laadussa parantamisen varaa',
              checkedPoints: 0.5,
              uncheckedPoints: 0
            }
          ]
        }),
        courseName: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
        courseInstanceId: 10011,
        master: false
      }
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('CheckLists', null, {})
  }
}
