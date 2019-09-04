import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Menu, Icon, Image } from 'semantic-ui-react'
import { logout } from '../../reducers/loginReducer'
import LogoutButton from '../LogoutButton'

/**
 * Navigation bar component
 */
class Nav extends Component {
  handleLogout = async e => {
    window.localStorage.removeItem('loggedLabtool')
    await this.props.logout()
  }

  render() {
    const user = { ...this.props.user.user }

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

          {this.props.user.user ? (
            <Menu.Item name="MyPage" as={Link} to="/labtool/mypage">
              <Icon name="home" />
              My page
            </Menu.Item>
          ) : (
            <p />
          )}

          {this.props.user.user ? (
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
            <LogoutButton />
          </Menu.Item>
        )}
      </Menu>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  }
}

export default connect(
  mapStateToProps,
  { logout }
)(Nav)
