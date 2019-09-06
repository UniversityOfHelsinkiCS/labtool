import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { logout } from '../reducers/loginReducer'
import { Button } from 'semantic-ui-react'

export const LogoutButton = ({ logout, history }) => (
  <Button
    onClick={() => {
      if (process.env.REACT_APP_USE_FAKE_LOGIN) {
        window.localStorage.removeItem('fakeShibboLoginUser')
      }
      logout()
      history.push('/')
    }}
  >
    Logout
  </Button>
)

export default withRouter(
  connect(
    null,
    { logout }
  )(LogoutButton)
)
