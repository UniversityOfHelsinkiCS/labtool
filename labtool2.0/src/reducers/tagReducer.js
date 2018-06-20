import { sortTags } from '../util/sort'

const INITIAL_STATE = {}

const tagsReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'TAG_CREATE_SUCCESS': {
      const id = action.response.id
      const changedTag = store.tags.filter(tag => tag.id === id)
      if (changedTag.length !== 0) {
        const newTagList = store.tags.map(tag => (tag.id !== id ? tag : action.response))
        return { ...store, tags: newTagList }
      } else {
        return { ...store, tags: [...store.tags, action.response] }
      }
    }
    case 'TAG_REMOVE_SUCCESS': {
      const newTagList = store.tags.filter(tag => tag.id !== action.response)
      return { ...store, tags: newTagList }
    }
    case 'TAGS_GET_ALL_SUCCESS':
      return { ...store, tags: sortTags(action.response) }
    case 'UNTAG_STUDENT_SUCCESS':
      return store
    case 'TAG_STUDENT_SUCCESS':
      return store
    case 'UNTAG_STUDENT_SUCCESS':
      return store
    default:
      return store
  }
}

export default tagsReducer
