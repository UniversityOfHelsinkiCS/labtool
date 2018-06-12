import React from 'react'
import { connect } from 'react-redux'
import { getOneCI } from '../../services/courseInstance'
import { insertCodeReviews } from '../../services/codeReview'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews } from '../../services/codeReview'
import { codeReviewReducer, initOneReview, initOrRemoveRandom, initCheckbox, initAllCheckboxes, randomAssign, codeReviewReset } from '../../reducers/codeReviewReducer'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown, Checkbox } from 'semantic-ui-react'

export class ModifyCourseInstanceReview extends React.Component {
  componentDidMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  componentWillUnmount() {
    this.props.codeReviewReset()
  }

  handleSubmit = reviewNumber => async e => {
    try {
      e.preventDefault()
      const codeReviews = this.props.codeReviewLogic.codeReviewStates[reviewNumber]
      const data = {
        codeReviews,
        reviewNumber
      }
      await this.props.bulkinsertCodeReviews(data)
    } catch (error) {
      console.log(error)
    }
  }

  addCodeReview = (reviewRound, id) => {
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
      if (!reviewInstance) {
        return 'None'
      }
      let reviewee = this.props.dropdownUsers.find(dropDownStudent => dropDownStudent.value === reviewInstance.toReview)
      return reviewee.text
    }

    return (
      <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
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
                          className="toReviewDropdown"
                          placeholder="Select student"
                          fluid
                          search
                          selection
                          options={this.props.dropdownUsers.filter(u => u.value !== data.id)}
                          onChange={this.addCodeReview(1, data.id)}
                          value={this.props.codeReviewLogic.currentSelections[1][data.id]}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <p>Current review: {getCurrentReviewer(2, data.id)}</p>
                        <Dropdown
                          className="toReviewDropdown"
                          placeholder="Select student"
                          fluid
                          search
                          selection
                          options={this.props.dropdownUsers.filter(u => u.value !== data.id)}
                          onChange={this.addCodeReview(2, data.id)}
                          value={this.props.codeReviewLogic.currentSelections[2][data.id]}
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
                  <Button onClick={this.handleSubmit(1)} size="small" style={{ float: 'left' }}>
                    Save
                  </Button>
                  <Button size="small" style={{ float: 'right' }} onClick={() => this.props.randomAssign({ reviewNumber: 1 })}>
                    Assign selected randomly
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <Button onClick={this.handleSubmit(2)} size="small" style={{ float: 'left' }}>
                    Save
                  </Button>
                  <Button size="small" style={{ float: 'right' }} onClick={() => this.props.randomAssign({ reviewNumber: 2 })}>
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

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: 'None'
    })
    data.map(d =>
      users.push({
        value: d.id,
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
  bulkinsertCodeReviews,
  randomAssign,
  codeReviewReset
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstanceReview)
