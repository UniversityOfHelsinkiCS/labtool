import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
  switch (action.type) {
  case 'CI_GET_ALL_SUCCESS':
    return action.response
    /*   case 'CI_GET_ONE_SUCCESS':
    return store.find(n => n.ohid === action.response) */ //This is possible solution.
  default:
    return store
  }
}

export default courseInstancereducer

/* 
export const getOneCI = (ohid) => {
  return async (dispatch) => {
    dispatch({
      type: 'CI_GET_ONE',
      response: ohid
    })
  }
} */