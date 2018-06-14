const INITIAL_STATE = {}

const tagsReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'TAG_CREATE_SUCCESS':
      return { ...store, tags: [...store.tags, action.response] }
    case 'TAGS_GET_ALL_SUCCESS':
      return { ...store, tags: action.response }
    default:
      return store
  }
}

export default tagsReducer
