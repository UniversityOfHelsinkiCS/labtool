import React from 'react'
import { connect } from 'react-redux'
import { getOneCI } from '../../services/courseInstance'
import { coursePageInformation } from '../../services/courseInstance'
import { codeReviewReducer } from '../../reducers/codeReviewReducer'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown } from 'semantic-ui-react'

export class ModifyCourseInstanceReview extends React.Component {
  componentDidMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  render() {
    const createHeaders = () => {
      const headers = []
      for (var i = 0; i < this.props.selectedInstance.amountOfCodeReviews; i++) {
        headers.push(<Table.HeaderCell key={i}>Code Review {i + 1} </Table.HeaderCell>)
      }
      return headers
    }

    return (
      <div style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <div className="ui grid">
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>
          </div>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell> Github </Table.HeaderCell>
                {createHeaders()}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData.data !== undefined ? (
                this.props.courseData.data.map(data => (
                  <Table.Row key={data.id}>
                    <Table.Cell>
                      {data.User.firsts} {data.User.lastname}
                    </Table.Cell>
                    <Table.Cell>
                      <p>{data.projectName}</p>
                      <a href={data.github}>{data.github}</a>
                    </Table.Cell>
                    <Dropdown placeholder='Select student' fluid search selection options={this.props.dropdownUsers} />
                    <Table.Cell>moi</Table.Cell>
                    <Table.Cell>moi</Table.Cell>
                  </Table.Row>
                ))
              ) : (
                  <div />
                )}
            </Table.Body>
          </Table>
        </div>
      </div>
    )
  }
}

const userHelper = data => {
  let users = []
  if (data) {
    data.map(d =>
      users.push({
        value: d.User.id,
        text: d.User.firsts + ' ' + d.User.lastname
      })
    )
  }
  return users
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    courseData: state.coursePage,
    selectedInstance: state.selectedInstance,
    codeReviewLogic: state.codeReviewLogic,
    dropdownUsers: userHelper(state.coursePage.data)
  }
}

const mapDispatchToProps = {
  getOneCI,
  clearNotifications,
  coursePageInformation
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstanceReview)
