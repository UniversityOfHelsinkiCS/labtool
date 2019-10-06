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

  if (data && data.__HEADERS) {
    options.headers = { ...options.headers, ...data.__HEADERS }
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
  dispatch({ type: `${prefix}ATTEMPT`, payload }) //handleRequest will handle this, look below
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
      .catch(err => {
        // the issue with Shibbo timeouts is that Shibbo will just return
        // a 302 for any backend request, which isn't easy to handle,
        // as the browser will just follow the 302 and tell *nothing* to
        // any AJAX library, like axios.

        // instead we'll check for a network error which will occur when
        // AJAX fails to send a request to Shibbo, as the SOP prevents
        // us from making such a request.

        if (err.message.toLowerCase() === 'network error') {
          console.warn('Session expired, reloading...')
          window.location.reload(true)
          return
        }

        store.dispatch({ type: `${payload.prefix}FAILURE`, response: err })
      })
  }
}
