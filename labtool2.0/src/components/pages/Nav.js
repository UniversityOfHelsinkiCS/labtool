import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Divider, Menu, Icon, Image } from 'semantic-ui-react'
import LogoutButton from '../LogoutButton'

import './Nav.css'

const MenuText = ({ active, children }) => <span className={active ? 'activeItem' : undefined}>{children}</span>

/**
 * Navigation bar component
 */
const Nav = props => {
  const user = { ...props.user.user }
  const onMyPage = props.location.pathname == '/labtool' || props.location.pathname == '/labtool/mypage'
  const onCourseList = props.location.pathname == '/labtool/courses'
  const onCourseImport = props.location.pathname == '/labtool/courseimport'
  const onAdmin = props.location.pathname == '/labtool/admin'

  return (
    <Menu
      icon="labeled"
      stackable
      inverted
      pointing
      borderless
      animation="overlay"
      attached
      style={{
        marginBottom: 25,
        backgroundColor: '#e9af43',
        borderBottomLeftRadius: '5px',
        borderBottomRightRadius: '5px'
      }}
    >
      <Menu.Menu position="left">
        <Menu.Item
          header
          as={Link}
          to="/labtool/mypage"
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
          <Menu.Item name="MyPage" active={onMyPage} as={Link} to="/labtool/mypage">
            <Icon name="home" />
            <MenuText active={onMyPage}>My page</MenuText>
          </Menu.Item>
        ) : (
          <p />
        )}

        {props.user.user ? (
          <Menu.Item name="Courses" active={onCourseList} as={Link} to="/labtool/courses">
            <Icon name="browser" />
            <MenuText active={onCourseList}>Courses</MenuText>
          </Menu.Item>
        ) : (
          <p />
        )}

        {props.courseImport.canImport && (
          <Menu.Item name="CourseImport" active={onCourseImport} as={Link} to="/labtool/courseimport">
            <Icon name="cloud download" />
            <MenuText active={onCourseImport}>Import</MenuText>
          </Menu.Item>
        )}
      </Menu.Menu>

      <Menu.Menu right="right">
        {user.sysop && (
          <Menu.Item name="AdminButton" as={Link} to="/labtool/admin">
            <Icon name="database" />
            <MenuText active={onAdmin}>Admin</MenuText>
          </Menu.Item>
        )}
        {user && (
          <Menu.Item style={{ margin: 'auto 0' }}>
            <LogoutButton logout={props.logout} />
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user,
    courseImport: state.courseImport
  }
}

Nav.propTypes = {
  user: PropTypes.object.isRequired,
  courseImport: PropTypes.object.isRequired,
  location: PropTypes.object,

  logout: PropTypes.func.isRequired
}

export default withRouter(connect(mapStateToProps, {})(Nav))
