import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Popup, Icon } from 'semantic-ui-react'

export const IssuesDisabledWarning = ({ onClick }) => (
  <Popup
    trigger={<Icon name="exclamation circle" onClick={onClick} size="large" color="yellow" style={{ cursor: onClick ? 'pointer' : 'auto' }} />}
    content={<span>This repository does not have issues enabled. {onClick && 'Click to hide this warning.'}</span>}
    hoverable
  />
)

IssuesDisabledWarning.propTypes = {
  onClick: PropTypes.func
}

export default connect(
  null,
  {}
)(IssuesDisabledWarning)
