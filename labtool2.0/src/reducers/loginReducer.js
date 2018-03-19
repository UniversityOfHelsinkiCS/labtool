import loginService from '../services/login'

const loginReducer = (state = {}, action) => {
    if (action.type === 'LOGIN_SUCCESS') {
        return action.response
    } else if (action.type === 'LOGOUT_SUCCESS')
        return {}
    return state
}

export const login = (user) => {
    return {

    }
}

export const logout = () => {
    return async (dispatch) => {
        await loginService.logout()
        dispatch({
            type: 'LOGOUT',
        })
    }
}


export default loginReducer