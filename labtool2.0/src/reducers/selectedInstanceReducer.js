
const selectedInstanceReducer = (store = '', action) => {
  switch (action.type) {
  case 'CI_GET_ONE_SUCCESS':
    return action.response
  default:
    return store
  }
}

export default selectedInstanceReducer
