import { useState, useEffect } from 'react'

import { getGithubRepo } from '../util/github'

export default repo => {
  const [githubRepo, setGithubRepo] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    console.log(repo)
    if (repo === null) {
      setGithubRepo(null)
      setError(null)
      return
    } else if (!repo) {
      return
    }

    const { result, cancel } = getGithubRepo(repo)

    result
      .then(result => {
        setError(null)
        setGithubRepo(result.data)
      })
      .catch(error => {
        setGithubRepo(null)
        setError(error)
      })

    return () => cancel()
  }, [repo])

  return { githubRepo, error }
}
