
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleRequest } from './util/apiConnection'

import courseInstance from './reducers/courseInstanceReducer'
import login from './reducers/loginReducer'
import notification from './reducers/notificationReducer'
import teacherInstance from './reducers/teacherInstanceReducer'
import studentInstance from './reducers/studentInstanceReducer'
import selectedInstance from './reducers/selectedInstanceReducer'
import coursePage from './reducers/coursePageReducer'

const reducer = combineReducers({
  courseInstance: courseInstance,
  user: login,
  notification: notification,
  teacherInstance: teacherInstance,
  studentInstance: studentInstance,
  selectedInstance: selectedInstance,
  coursePage: coursePage
})

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk, handleRequest)
  )
)

export default store