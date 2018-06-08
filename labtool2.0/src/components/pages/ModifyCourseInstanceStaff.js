import React from 'react'
import { getOneCI } from '../../services/courseInstance'
import { getAllUsers } from '../../services/user'
import { createOne, removeOne } from '../../services/teacherinstances'
import { connect } from 'react-redux'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Table, Container, Header, Button, Label, Form } from 'semantic-ui-react'

export class ModifyCourseInstanceStaff extends React.Component {
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

  handleSubmit = userId => async e => {
    try {
      e.preventDefault()
      const teacherInformation = {
        ohid: this.props.courseId,
        id: userId
      }
      await this.props.createOne(teacherInformation)
    } catch (error) {
      console.log(error)
    }
  }

  handleRemoval = userId => async e => {
    try {
      e.preventDefault()
      const teacherInformation = {
        ohid: this.props.courseId,
        id: userId
      }
      await this.props.removeOne(teacherInformation)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <Container>
        <div className="sixteen wide column" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <h2>Add and remove assistants</h2>
          <h2>{this.props.selectedInstance.name}</h2>
        </div>
        <Header as="h2">Users</Header>
        <Form id="myForm" onSubmit={this.handleSubmit}>
          <Table singleLine color="yellow" fixed>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
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
                      user.admin === true ? (
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
                          <Button onClick={this.handleRemoval(user.id)} size="tiny" color="green">
                            Remove assistant
                          </Button>
                        </div>
                      )
                    ) : (
                      <div>
                        <Label color="yellow" horizontal>
                          Student
                        </Label>
                        <Button onClick={this.handleSubmit(user.id)} size="tiny" color="green">
                          Add assistant
                        </Button>
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Form>
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

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    users: state.users,
    selectedInstance: state.selectedInstance
  }
}

const mapDispatchToProps = {
  getAllUsers,
  getOneCI,
  clearNotifications,
  createOne,
  removeOne
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstanceStaff)
