/**
 * Reducer for a single course instance.
 * 
  id(pin):  -- database id of the course
  name(pin): "Tietokantasovellus (periodi IV)" -- String, Name of the course
  start(pin):  -- Date, start date of the course
  end(pin):   -- date, end date of the course
  active(pin):  -- boolean, is the course active or not.
  weekAmount(pin): -- integer, how many weeks does the course have
  weekMaxPoints(pin): -- double, how many points does week have
  currentWeek(pin): -- integer, what is the current week
  ohid(pin): -- Opetushallitus id of the course, is often used instead of the database id
 * 
 */
const selectedInstanceReducer = (store = [], action) => {
  switch (action.type) {
    case 'CI_GET_ONE_SUCCESS':
      return action.response
    case 'TEACHER_CREATE_SUCCESS':
      return { ...store, teacherInstances: [...store.teacherInstances, action.response] }
    default:
      return store
  }
}

export default selectedInstanceReducer
