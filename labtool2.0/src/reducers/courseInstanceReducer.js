import courseInstanceService from '../services/courseInstance'

const courseInstancereducer = (store = [], action) => {
    if (action.type === 'INITIATE') {
        console.log(action.data)
        return action.data
    }

        case 'GET_USER':
return action.user

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


export const getOne = (id) => {
    return async (dispatch) => {
        const user = await userService.getOne(id)
        dispatch({
            type: 'GET_USER',
            user
        })
    }
}

export const getCourseInstance = () => {
    return async (dispatch) => {
        const courseInstances = await courseInstanceService.getAll()
        dispatch({
            type: 'INITIATE',
            data: courseInstances
        })
    }
}

export default courseInstancereducer