import React from 'react'
import { connect } from 'react-redux'
import { getOneCI } from '../../services/courseInstance'
import { insertCodeReviews } from '../../services/codeReview'
import { coursePageInformation } from '../../services/courseInstance'
import { codeReviewReducer, initOneReview, initOrRemoveRandom, initCheckbox, initAllCheckboxes } from '../../reducers/codeReviewReducer'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown, Checkbox } from 'semantic-ui-react'

export class ModifyCourseInstanceReview extends React.Component {
  componentDidMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  assignCodeReviews = round => {
    return () => {
      const data = {
        reviewNumber: round,
        codeReviews: this.props.codeReviewLogic.codeReviewStates[round]
      }
      console.log(data)
    }
  }

  initOneCodeReview = (reviewRound, id) => {
    return (e, data) => {
      const crData = {
        round: reviewRound,
        reviewer: id,
        toReview: data.value
      }
      this.props.initOneReview(crData)
      console.log(this.props.codeReviewLogic)
    }
  }

  initOrRemoveRandom = id => {
    return async () => {
      await this.props.initCheckbox(id)
      this.props.initOrRemoveRandom(id)
    }
  }

  selectAllCheckboxes = () => {
    return () => {
      let allCb = {}
      this.props.courseData.data.forEach(student => (allCb[student.id] = true))
      let randoms = this.props.courseData.data.map(student => student.id)
      this.props.initAllCheckboxes({ data: allCb, ids: randoms })
    }
  }
  render() {
    const createHeaders = () => {
      const headers = []
      for (var i = 0; i < this.props.selectedInstance.amountOfCodeReviews; i++) {
        headers.push(<Table.HeaderCell key={i}>Code Review {i + 1} </Table.HeaderCell>)
      }
      return headers
    }

    const getCurrentReviewer = (codeReviewRound, id) => {
      let reviewer = this.props.courseData.data.find(studentId => studentId.id === id)
      let reviewInstance = reviewer.codeReviews.find(cd => cd.reviewNumber === codeReviewRound && cd.studentInstanceId === id)
      let reviewee = this.props.dropdownUsers.find(dropDownStudent => dropDownStudent.value === reviewInstance.toReview)
      return reviewee.text
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
                <Table.HeaderCell />
                <Table.HeaderCell>Reviewer</Table.HeaderCell>
                <Table.HeaderCell> Project </Table.HeaderCell>
                <Table.HeaderCell key={1}>Code Review 1 </Table.HeaderCell>
                <Table.HeaderCell key={2}>Code Review 2 </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData.data !== undefined
                ? this.props.courseData.data.map(data => (
                  <Table.Row key={data.id}>
                    <Table.Cell>
                      {this.props.codeReviewLogic.checkBoxStates[data.id] === true ? (
                        <Checkbox checked onChange={this.initOrRemoveRandom(data.id)} />
                      ) : (
                          <Checkbox onChange={this.initOrRemoveRandom(data.id)} />
                        )}
                    </Table.Cell>
                    <Table.Cell>
                      {data.User.firsts} {data.User.lastname}
                    </Table.Cell>
                    <Table.Cell>
                      <p>{data.projectName}</p>
                      <a href={data.github}>{data.github}</a>
                    </Table.Cell>
                    <Table.Cell>
                      <p>Current review: {getCurrentReviewer(1, data.id)}</p>
                      <Dropdown
                        placeholder="Select student"
                        fluid
                        search
                        selection
                        options={this.props.dropdownUsers.filter(u => u.value !== data.id)}
                        onChange={this.initOneCodeReview(1, data.id)}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <p>Current review: {getCurrentReviewer(2, data.id)}</p>
                      <Dropdown
                        placeholder="Select student"
                        fluid
                        search
                        selection
                        options={this.props.dropdownUsers.filter(u => u.value !== data.id)}
                        onChange={this.initOneCodeReview(2, data.id)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))
                : null}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <Button onClick={this.selectAllCheckboxes()}>ALL</Button>
                </Table.HeaderCell>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell>
                  <Button onClick={this.assignCodeReviews(1)} size="small" style={{ float: 'left' }}>
                    Save
                  </Button>
                  <Button size="small" style={{ float: 'right' }}>
                    Assign selected randomly
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <Button onClick={this.assignCodeReviews(2)} size="small" style={{ float: 'left' }}>
                    Save
                  </Button>
                  <Button size="small" style={{ float: 'right' }}>
                    Assign selected randomly
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
      </div>
    )
  }
}

const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'None'
    })
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
  coursePageInformation,
  initOneReview,
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  insertCodeReviews
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstanceReview)
