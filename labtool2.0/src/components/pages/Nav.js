import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Divider, Menu, Icon, Image } from 'semantic-ui-react'
import LogoutButton from '../LogoutButton'

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
      borderless
      animation="overlay"
      style={{
        marginBottom: 25,
        backgroundColor: '#e9af43'
      }}
    >
      <Menu.Menu position="left" as={Link} to="/labtool/mypage">
        <Menu.Item
          header
          active={onMyPage}
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
            My page
          </Menu.Item>
        ) : (
          <p />
        )}

        {props.user.user ? (
          <Menu.Item name="Courses" active={onCourseList} as={Link} to="/labtool/courses">
            <Icon name="browser" />
            Courses
          </Menu.Item>
        ) : (
          <p />
        )}

        {props.courseImport.canImport && (
          <Menu.Item name="CourseImport" active={onCourseImport} as={Link} to="/labtool/courseimport">
            <Icon name="cloud download" />
            Import
          </Menu.Item>
        )}
      </Menu.Menu>

      <Menu.Menu right="right">
        {user.sysop && (
          <Menu.Item name="AdminButton" active={onAdmin} as={Link} to="/labtool/admin">
            <Icon name="database" />
            Admin
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

export default withRouter(
  connect(
    mapStateToProps,
    {}
  )(Nav)
)
