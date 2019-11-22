import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Loader } from 'semantic-ui-react'
import { Redirect } from 'react-router'
import { getAllCI } from '../../services/courseInstance'
import { resetLoading } from '../../reducers/loadingReducer'
import { getAllUsers, updateOtherUser } from '../../services/user'
import { clearNotifications } from '../../reducers/notificationReducer'
import { usePersistedState } from '../../hooks/persistedState'
import { AdminCourseList } from './AdminPage/AdminCourseList'
import { AdminUserList } from './AdminPage/AdminUserList'
import DocumentTitle from '../DocumentTitle'

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

  const documentTitle = <DocumentTitle title={'Admin'} />

  if (!props.user.user.sysop) {
    return <Redirect to={`/labtool`} />
  } else if (props.loading.loading) {
    return (
      <>
        <Loader active />
        {documentTitle}
      </>
    )
  }

  return (
    <>
      {documentTitle}
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
    </>
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
