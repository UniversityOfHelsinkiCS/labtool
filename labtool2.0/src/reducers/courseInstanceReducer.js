/**
 * 
 *  A table of course instances. ex
 * 
  id(pin): 1                              -- database id of the course
  name(pin): "Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)" -- String, Name of the course
  start(pin): "2018-03-11T21:00:00.000Z" -- Date, start date of the course
  end(pin): "2018-03-11T21:00:00.000Z"   -- date, end date of the course
  active(pin): false -- boolean, is the course active or not.
  weekAmount(pin): 7 -- integer, how many weeks does the course have
  weekMaxPoints(pin): 2 -- double, how many points does week have
  currentWeek(pin): 1 -- integer, what is the current week
  ohid(pin): "TKT20011.2018.K.A.1" -- Opetushallitus id of the course, is often used instead of the database id
 */
import { sortCourses } from '../util/sort'
import { createEuropeanDate, createShorterCourseid } from '../util/format'

// A few helperfunctions to create european form start / end date and to make a prettier course id `

const INITIAL_STATE = {}

// I map the results and add the desired UI values for dates and id to the object
// These values are only used in the frontend UI components
// We save the longer ID and the non european dates for possible database/Kurki-api operations that require them
const courseInstancereducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'CI_GET_ALL_SUCCESS': {
      const sortedCourses = sortCourses(action.response)
      return sortedCourses.map(m => {
        return { ...m, europeanStart: createEuropeanDate(m.start), europeanEnd: createEuropeanDate(m.end), shorterId: createShorterCourseid(m.ohid) }
      })
    }
    // case 'CI_MODIFY_ONE_SUCCESS':
    //   return action.response
    default:
      return store
  }
}

export default courseInstancereducer
