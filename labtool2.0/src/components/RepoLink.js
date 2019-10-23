import React from 'react'
import { Icon } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const RepoLink = ({ url }) => {
  const { Fragment } = React
  let cleanUrl = url
  cleanUrl = cleanUrl.replace(/^https?:\/\//, '')

  if (cleanUrl.startsWith('github.com/')) {
    const cleanUrlNoGithub = cleanUrl.substring('github.com/'.length)
    cleanUrl = (
      <Fragment>
        <Icon name="github" color="black" />
        {cleanUrlNoGithub}
      </Fragment>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {cleanUrl}
    </a>
  )
}

RepoLink.propTypes = {
  url: PropTypes.string.isRequired
}
export default RepoLink
