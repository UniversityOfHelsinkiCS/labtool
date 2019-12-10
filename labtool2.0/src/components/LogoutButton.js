import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Icon } from 'semantic-ui-react'

export const LogoutButton = ({ logout, user }) => (
  <Button color="red" onClick={logout}>
    <Icon name="sign out alternate" />
    {`Logout${user ? ` (${user.firsts} ${user.lastname.charAt(0)})` : ''}`}
  </Button>
)

LogoutButton.propTypes = {
  logout: PropTypes.func.isRequired,
  user: PropTypes.object
}

const mapStateToProps = state => {
  return {
    user: state.user.user
  }
}

export default connect(mapStateToProps)(LogoutButton)
