import axios from 'axios'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/api/courseInstances'

let token = null

export const getAll = () => {
  console.log('********get all from: ', baseUrl)
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

export const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

export default { getAll, getOne }
