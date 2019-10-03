import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'

export const LogoutButton = ({ logout }) => <Button onClick={logout}>Logout</Button>

LogoutButton.propTypes = {
  logout: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    null,
    {}
  )(LogoutButton)
)
