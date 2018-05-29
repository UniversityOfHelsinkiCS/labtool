import React, { Component } from 'react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { getAllUsers } from '../../services/user'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Table, Container, Header } from 'semantic-ui-react'

export class ModifyCourseInstaceStaff extends React.Component {
  componentWillMount() {
    this.props.clearNotifications()
    this.props.getOneCI(this.props.courseId)
    this.props.getAllUsers()
  }

  render() {
    // const removeDuplicateUsersFromTeachers = () => {
    //     let users = this.props.users
    //     let teacherInstaceIds = this.props.courseInstance.map(m => m.)

    // }
    return (
      <Container textAlign="center">
        <Header as="h2">Users</Header>
        <Table singleLine color="yellow">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <p>moi</p>
          <Table.Body />
        </Table>
      </Container>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users
  }
}

const mapDispatchToProps = {
  getAllUsers,
  getOneCI,
  clearNotifications
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstaceStaff)
