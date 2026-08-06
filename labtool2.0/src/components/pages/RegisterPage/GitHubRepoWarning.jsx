import React from 'react'
import PropTypes from 'prop-types'
import { Message } from 'semantic-ui-react'

export const GitHubRepoWarning = ({ githubRepo }) => {
  if (!githubRepo) {
    return <Message warning compact icon="warning sign" size="small" hidden={false} content="Your GitHub repository either is private or it does not exist" />
  }
  return null
}

GitHubRepoWarning.propTypes = {
  githubRepo: PropTypes.object
}

export default GitHubRepoWarning
