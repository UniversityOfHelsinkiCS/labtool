import loginService from '../services/login'
import { createNotification } from './notificationReducer'
import {  } from 'react-router-dom'

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
            dispatch(createNotification({ message: 'You have successfully logged in' }))

            //if (dbUser.created) {
            //this.setState({ firstLogin: true })
            //Tähän siis history.push(Emailin muutos sivu)
            //}
            
        } catch (error) {
<<<<<<< HEAD
            console.log('errori',error)
            dispatch(createNotification({ message: error.response.data.body.error, error:true }))            
=======
            console.log('ERRORI:', error)
            dispatch(createNotification(error.response.data.body.error))
>>>>>>> 13754bfdacd180e248e955929b2b590090708be2
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