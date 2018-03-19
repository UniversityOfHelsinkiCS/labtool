import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
    switch (action.type) {
        case 'CI_INITIATE':
            return action.data
        case 'GET_CI':
            return action.ci
        default:
            return store
    }
}

export const courseInstanceInitialization = () => {
    return async (dispatch) => {
        const courseInstances = await courseInstanceService.getAll()
        dispatch({
            type: 'CI_INITIATE',
            data: courseInstances
        })
    }
}

export const getCourseInstance = (id) => {
    return async (dispatch) => {
        const ci = await courseInstanceService.getOne(id)
        dispatch({
            type: 'GET_CI',
            ci
        })
    }
}

export default courseInstancereducer