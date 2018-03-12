import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
    if (action.type === 'INITIATE') {
        return action.data
    }
    return store
}

export const courseInstanceInitialization = () => {
    return async (dispatch) => {
        const anecdotes = await courseInstanceService.getAll()
        dispatch({
            type: 'INITIATE',
            data: anecdotes
        })
    }
}


export default courseInstancereducer