import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Button, Icon } from 'semantic-ui-react'

const BackButton = props => (
  <Link to={props.to}>
    <Button compact disabled={!props.enabled}>
      <Icon name="angle left" />
      <span>{props.text || 'Back'}</span>
    </Button>
  </Link>
)

BackButton.propTypes = {
  to: PropTypes.string,
  enabled: PropTypes.bool.isRequred,
  text: PropTypes.string
}

const presets = {
  modifyCIPage: state => `/labtool/ModifyCourseInstancePage/${state.selectedInstance.ohid}`,
  coursePage: state => `/labtool/courses/${state.selectedInstance.ohid}`
}

const mapStateToProps = (state, ownProps) => {
  let to
  try {
    to = presets[ownProps.preset](state)
  } catch (e) {
    to = ownProps.to
  }
  return {
    to,
    enabled: to !== undefined
  }
}

export default connect(
  mapStateToProps,
  null
)(BackButton)
