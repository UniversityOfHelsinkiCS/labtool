import loginService from '../services/login'
import { createNotification } from './notificationReducer'

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
            dispatch(createNotification('You have successfully logged in'))
        } catch (error) {
            console.log('ERRORI:', error)
            dispatch(createNotification(error.response.data.body.error))
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