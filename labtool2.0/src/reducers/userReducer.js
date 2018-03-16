import loginService from '../services/login'
<<<<<<< HEAD
import { createNotification } from './notificationReducer'
=======
>>>>>>> a662fb4399e177f3ef4e6b56ac1e98e8d78c135f
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
<<<<<<< HEAD
            dispatch(createNotification({ message: 'You have successfully logged in' }))

            //if (dbUser.created) {
            //this.setState({ firstLogin: true })
            //Tähän siis history.push(Emailin muutos sivu)
            //}

        } catch (error) {
            console.log('errori', error)
            dispatch(createNotification({ message: error.response.data.body.error, error: true }))
=======
        } catch (error) {
            console.log('errori', error)
>>>>>>> a662fb4399e177f3ef4e6b56ac1e98e8d78c135f
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