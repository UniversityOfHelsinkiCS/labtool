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

// a few helperfunctions to create european form start / end date and to make a prettier course id `

const createEuropeanDate = date => {
  return `${date.substring(8, 10)}.${date.substring(5, 7)}.${date.substring(0, 4)}`
}

const createShorterCourseid = ohid => {
  return `${ohid.substring(0, 8)}`
}


const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
    case 'CI_GET_ALL_SUCCESS':
      let x = action.response.map(m => { return { ...m, europeanStart: createEuropeanDate(m.start), europeanEnd: createEuropeanDate(m.end), shorterId: createShorterCourseid(m.ohid) } })
      return x
    case 'CI_MODIFY_ONE_SUCCESS':
      return store
    default:
      return store
  }
}

export default courseInstancereducer
