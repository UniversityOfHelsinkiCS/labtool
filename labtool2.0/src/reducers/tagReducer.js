const tagReducer = (store = [], action) => {
  switch (action.type) {
    case 'TAG_CREATE_SUCCESS':
      return { ...store, tags: [...store.tags, action.response] }
    default:
      return store
  }
}

export default tagReducer
