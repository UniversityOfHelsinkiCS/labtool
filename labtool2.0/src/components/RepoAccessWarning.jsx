import React from 'react'
import PropTypes from 'prop-types'
import { Popup, Icon } from 'semantic-ui-react'

export const RepoAccessWarning = ({ student, ohid, updateStudentProjectInfo }) => {
  const disableWarning = () => {
    if (window.confirm('Hide this warning? (Perhaps the repository is available now?)')) {
      updateStudentProjectInfo({ ...student, ohid: ohid, repoExists: null })
    }
  }

  const canClick = student && ohid && updateStudentProjectInfo
  return (
    <Popup
      trigger={<Icon name="warning sign" onClick={canClick ? disableWarning : null} size="large" color="red" style={{ cursor: canClick ? 'pointer' : 'auto' }} />}
      content={<span>This repository might not exist or it could be private. {canClick && 'Click to hide this warning.'}</span>}
      hoverable
    />
  )
}

RepoAccessWarning.propTypes = {
  student: PropTypes.object,
  ohid: PropTypes.string,
  updateStudentProjectInfo: PropTypes.func
}

export default RepoAccessWarning
