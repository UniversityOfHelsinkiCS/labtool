import { sortTags } from '../util/sort'

const INITIAL_STATE = { modifyTag: null }

const tagsReducer = (store = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return INITIAL_STATE
    case 'TAG_CREATE_SUCCESS': {
      const newTag = { ...action.response }
      const deleteId = newTag.deleteId
      delete newTag.deleteId
      const id = action.response.id
      const changedTag = store.tags.filter(tag => tag.id === id)
      const newModifyTag = deleteId && store.modifyTag === deleteId ? newTag.id : store.modifyTag
      if (changedTag.length !== 0) {
        const newTagList = store.tags.map(tag => (tag.id !== id ? tag : newTag))
        return { ...store, tags: newTagList.filter(tag => !deleteId || tag.id !== deleteId), modifyTag: newModifyTag }
      } else {
        return { ...store, tags: [...store.tags.filter(tag => !deleteId || tag.id !== deleteId), newTag], modifyTag: newModifyTag }
      }
    }
    case 'TAG_REMOVE_SUCCESS': {
      const newTagList = store.tags.filter(tag => tag.id !== action.response)
      return { ...store, tags: newTagList }
    }
    case 'TAGS_GET_ALL_SUCCESS':
      return { ...store, tags: sortTags(action.response) }
    case 'TAGS_UI_CREATE_NEW':
      return { ...store, modifyTag: null }
    case 'TAGS_UI_MODIFY':
      return { ...store, modifyTag: action.tag }
    case 'UNTAG_STUDENT_SUCCESS':
      return store
    case 'TAG_STUDENT_SUCCESS':
      return store
    default:
      return store
  }
}

export const willCreateNewTag = () => {
  return async dispatch => {
    dispatch({
      type: 'TAGS_UI_CREATE_NEW'
    })
  }
}

export const willModifyExistingTag = tag => {
  return async dispatch => {
    dispatch({
      type: 'TAGS_UI_MODIFY',
      tag
    })
  }
}

export default tagsReducer
