import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Menu, Button } from 'semantic-ui-react'
import { logout } from '../../reducers/loginReducer'
import studentinstancesService from '../../services/studentinstances'


class Nav extends Component {

  handleLogout = async (e) => {
    e.preventDefault()
    window.localStorage.removeItem('loggedUser')
    await this.props.logout()
    studentinstancesService.setToken('')
  }

  render() {
    const user = { ...this.props.user.returnedUser }

    return (
      <main>

        <Menu
          stackable
          inverted
          borderless
          animation='overlay'
          style={{
            marginBottom: 25,
            backgroundColor: '#e9af43',
          }}>

          <Menu.Menu position='left'>

            <Menu.Item header>
              Labtool 2.0
            </Menu.Item>

            <Menu.Item link>
              <Link to="/mypagestudent">My page</Link>
            </Menu.Item>

            <Menu.Item link>
              <Link to="/courses">Courses</Link>
            </Menu.Item>


          </Menu.Menu>

          <Menu.Menu position='right'>

            <Menu.Item>
              <em>{user.firsts} logged in</em>
            </Menu.Item>

            <Menu.Item link>
              <Button onClick={this.handleLogout} ><Link to="/">Logout
              </Link></Button>
            </Menu.Item>

          </Menu.Menu>

        </Menu>

      </main>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}


export default connect(mapStateToProps, { logout })(Nav)
