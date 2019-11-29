import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Button, Icon } from 'semantic-ui-react'

export const LogoutButton = ({ logout }) => (
  <Button style={{ backgroundColor: '#faffd9' }} onClick={logout}>
    <Icon name="sign out alternate" />
    Logout
  </Button>
)

LogoutButton.propTypes = {
  logout: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    null,
    {}
  )(LogoutButton)
)
