import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Loader, Label, Table, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { HorizontalScrollable } from '../HorizontalScrollable'
import { formatCourseName } from '../../util/format'
import { getAllCI } from '../../services/courseInstance'
import { resetLoading } from '../../reducers/loadingReducer'
import { getAllUsers, updateOtherUser } from '../../services/user'
import { clearNotifications } from '../../reducers/notificationReducer'
import { usePersistedState } from '../../hooks/persistedState'
import { sortUsersBySysopLastname } from '../../util/sort'

const AdminCourseList = ({ courses }) => {
  if (!Array.isArray(courses)) {
    return <div />
  }

  return (
    <HorizontalScrollable>
      <Table singleLine color="yellow" style={{ overflowX: 'visible' }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="1">Course ID</Table.HeaderCell>
            <Table.HeaderCell colSpan="1">Course name</Table.HeaderCell>
            <Table.HeaderCell colSpan="1">Course start date</Table.HeaderCell>
            <Table.HeaderCell colSpan="2"> </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {courses.map(instance => (
            <Table.Row key={instance.id}>
              <Table.Cell>{instance.shorterId} </Table.Cell>
              <Table.Cell>
                <strong>{formatCourseName(instance.name, instance.ohid, instance.start)}</strong>
              </Table.Cell>

              <Table.Cell> {instance.europeanStart} </Table.Cell>
              <Table.Cell textAlign="center">
                <Popup
                  trigger={
                    <Button
                      circular
                      size="tiny"
                      icon={{ name: 'edit', size: 'large', color: 'orange' }}
                      as={Link}
                      to={{
                        pathname: `/labtool/ModifyCourseInstanceStaff/${instance.ohid}`,
                        state: { fromAdmin: true }
                      }}
                    />
                  }
                  position="top right"
                  content="Manage instructors for this course"
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </HorizontalScrollable>
  )
}

AdminCourseList.propTypes = {
  courses: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
}

const AdminUserList = ({ me, users, updateOtherUser }) => {
  const setAdmin = (userId, name, newAdmin) => () => {
    const message = `Are you sure you want to ${newAdmin ? 'grant admin rights to' : 'remove admin rights from'} ${name}?`
    if (window.confirm(message)) {
      const selfInflicted = userId === me.user.id
      if (selfInflicted && !newAdmin && !window.confirm('You probably do NOT want to remove admin rights from yourself. Are you really sure?')) {
        return
      }
      updateOtherUser({ id: userId, sysop: newAdmin })
    }
  }
  const sortedUsers = sortUsersBySysopLastname(users)

  return (
    <Table singleLine color="yellow" fixed>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedUsers.map(user => (
          <Table.Row key={user.id}>
            <Table.Cell>
              {user.firsts} {user.lastname}
              <br />
              <a href={`mailto:${user.email}`}>{user.email}</a>
            </Table.Cell>
            <Table.Cell>
              {user.teacher && (
                <Label color="orange" horizontal>
                  Teacher
                </Label>
              )}
              {user.sysop ? (
                <div>
                  <Label color="orange" horizontal>
                    Admin
                  </Label>
                  <Button onClick={setAdmin(user.id, `${user.firsts} ${user.lastname}`, false)} size="tiny" color="green">
                    Remove admin
                  </Button>
                </div>
              ) : (
                <div>
                  <Label horizontal>Not admin</Label>
                  <Button onClick={setAdmin(user.id, `${user.firsts} ${user.lastname}`, true)} size="tiny" color="green">
                    Make admin
                  </Button>
                </div>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

AdminUserList.propTypes = {
  me: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  updateOtherUser: PropTypes.func.isRequired
}

export const AdminPage = props => {
  const state = usePersistedState('AdminPage', {
    coursesList: false,
    usersList: false
  })

  useEffect(() => {
    props.clearNotifications()
  }, [])

  useEffect(() => {
    if (state.coursesList) {
      props.resetLoading()
      props.getAllCI()
    }
  }, [state.coursesList])

  useEffect(() => {
    if (state.usersList) {
      props.resetLoading()
      props.getAllUsers()
    }
  }, [state.usersList])

  if (!props.user.user.sysop) {
    return <Redirect to={`/labtool`} />
  } else if (props.loading.loading) {
    return <Loader active />
  }

  return (
    <div className="AdminPage">
      <h2>Welcome to the admin interface.</h2>
      <Button compact className={`ui button`} onClick={() => (state.coursesList = !state.coursesList)}>
        {state.coursesList ? 'Hide courses' : 'Manage courses'}
      </Button>
      <br />
      <br />
      {state.coursesList && <AdminCourseList courses={props.courseInstance} />}
      <br />
      <hr />
      <br />
      <Button compact className={`ui button`} onClick={() => (state.usersList = !state.usersList)}>
        {state.usersList ? 'Hide users' : 'Manage users'}
      </Button>
      <br />
      {state.usersList && <AdminUserList me={props.user} users={props.users} updateOtherUser={props.updateOtherUser} />}
    </div>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user,
    courseInstance: state.courseInstance,
    users: state.users,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  getAllCI,
  resetLoading,
  getAllUsers,
  updateOtherUser,
  clearNotifications
}

AdminPage.propTypes = {
  user: PropTypes.object.isRequired,
  courseInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  users: PropTypes.array.isRequired,
  loading: PropTypes.object.isRequired,

  getAllCI: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  getAllUsers: PropTypes.func.isRequired,
  updateOtherUser: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminPage)
