import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
    if (action.type === 'INITIATE') {
        console.log(action.data)
        return action.data
    }
    return store
}

export const courseInstanceInitialization = () => {
    return async (dispatch) => {
        const courseInstances = await courseInstanceService.getAll()
        dispatch({
            type: 'INITIATE',
            data: courseInstances
        })
    }
}


export default courseInstancereducer