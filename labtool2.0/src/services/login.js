
import axios from 'axios'
const baseUrl = process.env.REACT_APP_BACKEND_URL + '/login'

const login = async (loginInformation) => {
  const response = await axios.post(baseUrl, loginInformation)
  return response.data
}

export default { login }