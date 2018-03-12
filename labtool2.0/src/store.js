
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import courseInstance from './reducers/courseInstanceReducer'
import user from './reducers/userReducer'


const reducer = combineReducers({
  courseInstance: courseInstance,
  user: user
})

const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
)

export default store