import axios from 'axios'

const { CancelToken } = axios

const githubAxios = axios.create({
  baseURL: 'https://api.github.com'
})

export const getGithubRepo = repo => {
  const source = CancelToken.source()
  return {
    result: githubAxios.get(`repos/${repo}`, { cancelToken: source.token }).catch(error => {
      //Ignore cancellations
      if (!axios.isCancel(error)) {
        return Promise.reject(error)
      }
    }),
    cancel: source.cancel
  }
}
