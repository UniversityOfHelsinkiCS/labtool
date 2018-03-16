import loginService from '../services/login'
import { } from 'react-router-dom'

const userReducer = (store = null, action) => {
    if (action.type === 'LOGIN') {
        return action.data
    } else if (action.type === 'LOGOUT')
        return null
    return store
}

export const login = (user) => {
    return async (dispatch) => {
        try {
            const dbUser = await loginService.login(user)
            dispatch({
                type: 'LOGIN',
                data: dbUser
            })
        } catch (error) {
            console.log('errori', error)
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