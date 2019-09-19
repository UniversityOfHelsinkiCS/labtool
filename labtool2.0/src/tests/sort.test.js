import { sortCourses } from '../util/sort'

describe('sort.js', () => {
  it('sorts courses by start date and promotes active to the top', () => {
    var response = [
      {
        id: 1,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
        start: '2018-03-03T21:00:00.000Z',
        end: '2018-03-03T21:00:00.000Z',
        active: false,
        weekAmount: 7,
        weekMaxPoints: 2,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-05-22T17:55:15.769Z',
        updatedAt: '2018-05-22T17:55:15.769Z'
      },
      {
        id: 2,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
        start: '2018-03-11T21:00:00.000Z',
        end: '2018-03-11T21:00:00.000Z',
        active: true,
        weekAmount: 7,
        weekMaxPoints: 2,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-05-22T17:55:15.769Z',
        updatedAt: '2018-05-22T17:55:15.769Z'
      },
      {
        id: 3,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
        start: '2018-04-11T21:00:00.000Z',
        end: '2018-04-11T21:00:00.000Z',
        active: false,
        weekAmount: 7,
        weekMaxPoints: 2,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-05-22T17:55:15.769Z',
        updatedAt: '2018-05-22T17:55:15.769Z'
      }
    ]
    response = sortCourses(response)
    expect(response[0].id).toBe(2)
    expect(response[1].id).toBe(3)
    expect(response[2].id).toBe(1)
  })

  it('Sorts by time of day', () => {
    var response = [
      {
        id: 1,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
        start: '2018-03-03T21:00:00.000Z',
        end: '2018-03-03T21:00:00.000Z',
        active: false,
        weekAmount: 7,
        weekMaxPoints: 2,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-05-22T17:55:15.769Z',
        updatedAt: '2018-05-22T17:55:15.769Z'
      },
      {
        id: 2,
        name: 'Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)',
        start: '2018-03-03T21:00:00.001Z',
        end: '2018-03-03T21:00:00.001Z',
        active: false,
        weekAmount: 7,
        weekMaxPoints: 2,
        currentWeek: 1,
        ohid: 'TKT20011.2018.K.A.1',
        createdAt: '2018-05-22T17:55:15.769Z',
        updatedAt: '2018-05-22T17:55:15.769Z'
      }
    ]
    response = sortCourses(response)
    expect(response[0].id).toBe(2)
    expect(response[1].id).toBe(1)
  })
})
