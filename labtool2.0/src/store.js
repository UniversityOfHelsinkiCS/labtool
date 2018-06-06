import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { handleRequest } from './util/apiConnection'

import courseInstance from './reducers/courseInstanceReducer'
import login from './reducers/loginReducer'
import users from './reducers/userReducer'
import notification from './reducers/notificationReducer'
import teacherInstance from './reducers/teacherInstanceReducer'
import studentInstance from './reducers/studentInstanceReducer'
import selectedInstance from './reducers/selectedInstanceReducer'
import coursePage from './reducers/coursePageReducer'
import emailPage from './reducers/emailReducer'
import assistant from './reducers/assistantReducer'
import coursePageLogic from './reducers/coursePageLogicReducer'
import codeReviewLogic from './reducers/codeReviewReducer'
/**
 * The store, that takes all the redux reducers. Index imports it.
 * It also uses middlewares, the most important being apiConnection, named
 * handleRequest.
 *
 * All the reducers need to be added here.
 */
const reducer = combineReducers({
  courseInstance: courseInstance,
  user: login,
  notification: notification,
  teacherInstance: teacherInstance,
  studentInstance: studentInstance,
  selectedInstance: selectedInstance,
  coursePage: coursePage,
  emailPage: emailPage,
  users: users,
  assistant: assistant,
  coursePageLogic: coursePageLogic,
  codeReviewLogic: codeReviewLogic
})

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk, handleRequest)))

export default store
