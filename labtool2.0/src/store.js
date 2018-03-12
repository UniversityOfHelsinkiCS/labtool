
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import courseInstance from './reducers/courseInstanceReducer'
import notification from './reducers/notificationReducer'

const reducer = combineReducers({
  courseInstance: courseInstance,
  notification: notification
})

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
)

export default store