import loginService from '../services/login'

const userReducer = (store = null, action) => {
    if (action.type === 'LOGIN') {
        return action.data
    } else if (action.type === 'LOGOUT')
        return null
    return store
}

export const login = (username, password) => {
    return async (dispatch) => {
        const user = await loginService.login(username, password)
        dispatch({
            type: 'LOGIN',
            data: user
        })
    }
}

export const logout = () => {
    return async (dispatch) => {
        const user = await loginService.logout()
        dispatch({
            type: 'LOGOUT',
        })
    }
}


export default userReducer