
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleRequest } from './util/apiConnection'

import courseInstance from './reducers/courseInstanceReducer'
import user from './reducers/userReducer'
import notification from './reducers/notificationReducer'

const reducer = combineReducers({
  courseInstance: courseInstance,
  user: user,
  notification: notification
})

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk, handleRequest)
  )
)

export default store