import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'

export const LogoutButton = ({ logout }) => <Button onClick={logout}>Logout</Button>

export default withRouter(
  connect(
    null,
    {}
  )(LogoutButton)
)
