import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { getOneCI } from '../../services/courseInstance'
import { getAllUsers } from '../../services/user'
import { createOne, removeOne } from '../../services/teacherinstances'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Table, Header, Button, Label, Form, Loader } from 'semantic-ui-react'
import { resetLoading } from '../../reducers/loadingReducer'
import { sortUsersByTeacherAssistantLastname } from '../../util/sort'

import BackButton from '../BackButton'
import DocumentTitle from '../DocumentTitle'

export const ModifyCourseInstanceStaff = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.clearNotifications()
    props.getOneCI(props.courseId)
    props.getAllUsers()
  }, [])

  const getTeacherIds = () => {
    if (props.selectedInstance.teacherInstances) {
      return props.selectedInstance.teacherInstances.map(teacher => teacher.userId)
    }
    return []
  }

  const handleSubmit = userId => async e => {
    try {
      e.preventDefault()
      const teacherInformation = {
        ohid: props.courseId,
        id: userId
      }
      await props.createOne(teacherInformation)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoval = userId => async e => {
    try {
      e.preventDefault()
      const teacherInformation = {
        ohid: props.courseId,
        id: userId
      }
      await props.removeOne(teacherInformation)
    } catch (error) {
      console.error(error)
    }
  }

  let sortedUsers = props.users
  if (props.selectedInstance && props.selectedInstance.teacherInstances && props.users) {
    sortedUsers = sortUsersByTeacherAssistantLastname(props.users, props.selectedInstance.teacherInstances)
  }
  return (
    <>
      <DocumentTitle title="Modify course instance" />
      <div>
        <BackButton preset={props.location.state && props.location.state.fromAdmin ? 'sysopModifyCIPage' : 'modifyCIPage'} />
        <div className="sixteen wide column" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <h2>Add and remove assistants</h2>
          <h2>{props.selectedInstance.name}</h2>
        </div>
        <Header as="h2">Users</Header>
        <Form id="myForm" onSubmit={handleSubmit}>
          {props.loading.loading ? (
            <Loader active />
          ) : (
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
                      {getTeacherIds().includes(user.id) ? (
                        user.teacher ? (
                          <div>
                            <Label color="orange" horizontal>
                              Teacher
                            </Label>
                          </div>
                        ) : (
                          <div>
                            <Label color="orange" horizontal>
                              Assistant
                            </Label>
                            <Button onClick={handleRemoval(user.id)} size="tiny" color="green">
                              Remove assistant
                            </Button>
                          </div>
                        )
                      ) : (
                        <div>
                          <Button onClick={handleSubmit(user.id)} size="tiny" color="green">
                            Add assistant
                          </Button>
                        </div>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Form>
      </div>
    </>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    users: state.users,
    selectedInstance: state.selectedInstance,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  getAllUsers,
  getOneCI,
  clearNotifications,
  createOne,
  removeOne,
  resetLoading
}

ModifyCourseInstanceStaff.propTypes = {
  courseId: PropTypes.string.isRequired,
  location: PropTypes.object,

  users: PropTypes.array.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  getAllUsers: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  createOne: PropTypes.func.isRequired,
  removeOne: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ModifyCourseInstanceStaff)
)
