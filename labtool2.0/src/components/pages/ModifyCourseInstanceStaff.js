import React, { Component } from 'react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { getAllUsers } from '../../services/user'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Table, Container, Header, Button, Label } from 'semantic-ui-react'

export class ModifyCourseInstaceStaff extends React.Component {
  componentWillMount() {
    this.props.clearNotifications()
    this.props.getOneCI(this.props.courseId)
    this.props.getAllUsers()
  }

  getTeacherIds = () => {
    if (this.props.selectedInstance.teacherInstances) {
      return this.props.selectedInstance.teacherInstances.map(teacher => teacher.userId)
    }
    return []
  }

  render() {
    return (
      <Container>
        <Header as="h2">Users</Header>
        <Table singleLine color="yellow">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.users.map(user => (
              <Table.Row key={user.id}>
                <Table.Cell>
                  {user.firsts} {user.lastname}
                </Table.Cell>
                <Table.Cell>
                  {this.getTeacherIds().includes(user.id) ? (
                    <Label color="yellow" horizontal>
                      Admin
                    </Label>
                  ) : (
                    <div>
                      <Label color="yellow" horizontal>
                        Non-admin
                      </Label>
                      <Button size="tiny" color="green">Add to admins</Button>
                    </div>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    )
  }
}

// const sortUsers = (users, selectedInstance) => {
//   let teacherInstaceIds = []
//   let usersWhoAreTeachers = []
//   if (selectedInstance.teacherInstances) {
//     teacherInstaceIds = selectedInstance.teacherInstances.map(f => f.userId)
//     return users.filter(f => !teacherInstaceIds.includes(f.id))
//   }
//   return []
// }

const mapStateToProps = state => {
  return {
    users: state.users,
    selectedInstance: state.selectedInstance
  }
}

const mapDispatchToProps = {
  getAllUsers,
  getOneCI,
  clearNotifications
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstaceStaff)
