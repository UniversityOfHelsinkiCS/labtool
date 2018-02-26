import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/courseInstances'

let token = null

const getAll = async() => {
  const request = await axios.get(baseUrl)
  return request.then(response => response.data)
}

const getOne = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}