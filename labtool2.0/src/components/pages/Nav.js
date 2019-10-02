import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Menu, Icon, Image } from 'semantic-ui-react'
import LogoutButton from '../LogoutButton'

/**
 * Navigation bar component
 */
const Nav = props => {
  const user = { ...props.user.user }

  return (
    <Menu
      icon="labeled"
      stackable
      inverted
      borderless
      animation="overlay"
      style={{
        marginBottom: 25,
        backgroundColor: '#e9af43'
      }}
    >
      <Menu.Menu position="left">
        <Menu.Item
          header
          style={{
            bottom: '4px'
          }}
        >
          <Image
            size="mini"
            src={`${process.env.PUBLIC_URL}/favicon.ico`}
            style={{
              bottom: '2px'
            }}
          />
          Labtool 2.0
        </Menu.Item>

        {props.user.user ? (
          <Menu.Item name="MyPage" as={Link} to="/labtool/mypage">
            <Icon name="home" />
            My page
          </Menu.Item>
        ) : (
          <p />
        )}

        {props.user.user ? (
          <Menu.Item name="Courses" as={Link} to="/labtool/courses">
            <Icon name="browser" />
            Courses
          </Menu.Item>
        ) : (
          <p />
        )}
      </Menu.Menu>

      {user && (
        <Menu.Item position="right" style={{ margin: 'auto 0' }}>
          <LogoutButton logout={props.logout} />
        </Menu.Item>
      )}
    </Menu>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user
  }
}

Nav.propTypes = {
  user: PropTypes.object.isRequired,

  logout: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  {}
)(Nav)
