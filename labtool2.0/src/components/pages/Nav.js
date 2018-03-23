import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Menu, Button } from 'semantic-ui-react'



class Nav extends React.Component {

  render() {

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

            <Menu.Item text>
              <em>*Matti-Kalevi Meikäläinen-Teikäläinen* logged in</em>
            </Menu.Item>

            <Menu.Item link>
              <Button color='white' >
                <Link to="/loginpage" color='white'>Logout</Link>
              </Button>
            </Menu.Item>

          </Menu.Menu>

        </Menu>

      </main>
    )
  }
}

export default Nav
