import loginService from '../services/login'

const userReducer = (store = null, action) => {
    if (action.type === 'LOGIN') {
        return action.data
    } else if (action.type === 'LOGOUT')
        return null
    return store
}

export const login = (user) => {
    return async (dispatch) => {
        console.log('hello: ', user)
        try {
            const dbUser = await loginService.login(user)
            dispatch({
                type: 'LOGIN',
                data: dbUser
            })
        } catch (error) {
            console.log('ERRORI:', error)
        }
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


export default userReducer