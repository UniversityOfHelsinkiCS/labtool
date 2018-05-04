import axios from 'axios'

/**
 * This middleware forms all the requests to the api that is used,
 * and also dispatchs store messages depending on the failure
 * or success of the call. Axios is used.
 * 
 * The method that is used from here is 'callApi',
 * that you can give path, data, what operation is done, 
 * and also token. Path can be given from .env file,
 * and it can be configured to depend on the
 * enviroment.
 * 
 * If the call is success, a dispatch of "{method}SUCCESS" is given,
 * otherwise "{method}FAILURE" is dispatched, and all reducers listen
 * to these dispatches, and can be made to react accordingly.
 *  
 */
const createApiUrl = path => {
  const API_PATHS = ['staging', 'v2']
  const mode = path.split('/')[1]
  return API_PATHS.includes(mode) ? `/${mode}/api` : ''
}

export const getAxios = () => {
  let hostUrl
  if (process.env.NODE_ENV === 'development') {
    hostUrl = 'http://localhost:3001/api'
  } else {
    hostUrl = '/labtool-backend/api'
  }
  const apiPath = createApiUrl(window.location.pathname)
  return axios.create({
    baseURL: `${hostUrl}${apiPath}`
  })
}

function callApi(url, method = 'get', data, prefix, token) {
  const options = {
    headers: {
      Authorization: `bearer ${token}`
    }
  }
  switch (method) {
    case 'get':
      return getAxios().get(url, options)
    case 'post':
      return getAxios().post(url, data, options)
    case 'put':
      return getAxios().put(url, data, options)
    case 'delete':
      return getAxios().delete(url, options)
    default:
      return Promise.reject(new Error('Invalid http method'))
  }
}
export const callController = (route, prefix, data, method = 'get') => dispatch => {
  const payload = {
    route,
    method,
    data,
    prefix
  }
  dispatch({ type: `${prefix}ATTEMPT`, payload })
}

// If you feel a sudden urge to call this. Don't.
export const handleRequest = store => next => action => {
  next(action)
  const { payload } = action
  if (payload) {
    callApi(payload.route, payload.method, payload.data, payload.prefix, store.getState().user.token)
      .then(res => {
        store.dispatch({ type: `${payload.prefix}SUCCESS`, response: res.data })
      })
      .catch(err => store.dispatch({ type: `${payload.prefix}FAILURE`, response: err }))
  }
}
