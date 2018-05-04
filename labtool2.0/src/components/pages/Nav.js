import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Menu, Icon, Image } from 'semantic-ui-react'
import { logout } from '../../reducers/loginReducer'


/**
 * Navigation bar component
 */
class Nav extends Component {
  state = { activeItem: 'MyPage' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  handleLogout = async e => {
    e.preventDefault()
    window.localStorage.removeItem('loggedLabtool')
    await this.props.logout()
  }

  render() {
    const user = { ...this.props.user.user }
    const { activeItem } = this.state

    return (
      <main>
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
                src="/favicon.ico"
                style={{
                  bottom: '2px'
                }}
              />
              Labtool 2.0
            </Menu.Item>

            {this.props.user.user ? (
              <Menu.Item name="MyPage" as={Link} to="/labtool/mypage" active={activeItem === 'MyPage'} onClick={this.handleItemClick}>
                <Icon name="home" />
                My page
              </Menu.Item>
            ) : (
              <p />
            )}

            {this.props.user.user ? (
              <Menu.Item name="Courses" as={Link} to="/labtool/courses" active={activeItem === 'Courses'} onClick={this.handleItemClick}>
                <Icon name="browser" />
                Courses
              </Menu.Item>
            ) : (
              <p />
            )}
          </Menu.Menu>

          {this.props.user.user ? (
            <div>
              <Menu.Menu position="right">
                <Menu.Item name="Logout" as={Link} to="/labtool" onClick={this.handleLogout}>
                  <Icon name="log out" />
                  <p>
                    {' '}
                    Logout <em>{user.username} </em>
                  </p>
                </Menu.Item>
              </Menu.Menu>
            </div>
          ) : (
            <div />
          )}
        </Menu>
      </main>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps, { logout })(Nav)
