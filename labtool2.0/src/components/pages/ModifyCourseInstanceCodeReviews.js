import React from 'react'
import { connect } from 'react-redux'
import { getOneCI } from '../../services/courseInstance'
import { insertCodeReviews } from '../../services/codeReview'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews } from '../../services/codeReview'
import {
  codeReviewReducer,
  initOneReview,
  initOrRemoveRandom,
  initCheckbox,
  initAllCheckboxes,
  randomAssign,
  codeReviewReset,
  selectDropdown,
  toggleCreate,
  createStates
} from '../../reducers/codeReviewReducer'
import { clearNotifications } from '../../reducers/notificationReducer'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown, Checkbox } from 'semantic-ui-react'
import Notification from '../../components/pages/Notification'

export class ModifyCourseInstanceReview extends React.Component {
  componentDidMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  componentWillUnmount() {
    this.props.codeReviewReset()
  }

  checkStates = () => {
    this.props.codeReviewLogic.statesCreated ? null : this.props.createStates(this.props.selectedInstance.amountOfCodeReviews)
  }

  handleSubmit = reviewNumber => async e => {
    try {
      e.preventDefault()
      const codeReviews = this.props.codeReviewLogic.codeReviewStates[reviewNumber]
      const courseId = this.props.selectedInstance.id
      reviewNumber === 'create' ? (reviewNumber = this.props.selectedInstance.amountOfCodeReviews + 1) : reviewNumber
      const data = {
        codeReviews,
        reviewNumber,
        courseId
      }
      await this.props.bulkinsertCodeReviews(data)
    } catch (error) {}
  }

  addCodeReview = (reviewRound, id) => {
    return e => {
      const toReviewId = parseInt(e.target.value)
      const crData = {
        round: reviewRound,
        reviewer: id,
        toReview: toReviewId
      }
      this.props.initOneReview(crData)
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

  createDropdown = () => {
    return (e, data) => {
      this.checkStates()
      this.props.selectDropdown(data.value)
    }
  }

  toggleCreate = () => {
    this.checkStates()
    this.props.toggleCreate()
  }

  getCurrentReviewer = (codeReviewRound, id) => {
    let reviewer = this.props.courseData.data.find(studentId => studentId.id === id)
    let reviewInstance = reviewer.codeReviews.find(cd => cd.reviewNumber === codeReviewRound && cd.studentInstanceId === id)
    if (!reviewInstance) {
      return 'None'
    }
    let reviewee = this.props.dropdownUsers.find(dropDownStudent => dropDownStudent.value === reviewInstance.toReview)
    return reviewee.text
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
      <div className="ModifyCourseInstanceCodeReviews" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <div className="ui grid">
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>
          </div>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell>Tags</Table.HeaderCell>
                <Table.HeaderCell>Reviewer</Table.HeaderCell>
                <Table.HeaderCell> Project </Table.HeaderCell>
                <Table.HeaderCell key={1}>
                  {' '}
                  <Dropdown onChange={this.createDropdown()} placeholder="Select code review" fluid options={this.props.dropdownCodeReviews} />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {this.props.codeReviewLogic.showCreate ? (
                    <div>
                      Create new code review ( {this.props.selectedInstance.amountOfCodeReviews + 1} )
                      <Button size="tiny" style={{float:"right"}} onClick={() => this.toggleCreate()} compact>
                        Hide
                      </Button>
                    </div>
                  ) : (
                    <Button size="tiny" onClick={() => this.toggleCreate()} compact>
                      +
                    </Button>
                  )}
                </Table.HeaderCell>
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
                      <Table.Cell />
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>
                        <p>{data.projectName}</p>
                        <a href={data.github}>{data.github}</a>
                      </Table.Cell>
                      <Table.Cell>
                        {this.props.codeReviewLogic.selectedDropdown ? (
                          <div>
                            <p>Current review: {this.getCurrentReviewer(this.props.codeReviewLogic.selectedDropdown, data.id)}</p>
                            <select className="toReviewDropdown" onChange={this.addCodeReview(this.props.codeReviewLogic.selectedDropdown, data.id)}>
                              {this.props.dropdownUsers.map(
                                d =>
                                  this.props.codeReviewLogic.currentSelections[this.props.codeReviewLogic.selectedDropdown][data.id] == d.value ? (
                                    <option selected="selected" key={d.value} value={d.value}>
                                      {d.text}
                                    </option>
                                  ) : (
                                    <option key={d.value} value={d.value}>
                                      {d.text}
                                    </option>
                                  )
                              )}
                            </select>
                          </div>
                        ) : null}
                        {/* // onChange={this.addCodeReview(1, data.id)}
                        // value={this.props.codeReviewLogic.currentSelections[1][data.id]} */}
                        {/* <p>Current review: {getCurrentReviewer(1, data.id)}</p>
                        <select className="toReviewDropdown" onChange={this.addCodeReview(1, data.id)}>
                          {this.props.dropdownUsers.map(d => (
                            <option key={d.value} value={d.value}>
                              {d.text}
                            </option>
                          ))}
                        </select> */}
                        {/*
                         Semantic ui dropdown works very slow so we replaced them with html select
                        }
                        {/* <Dropdown
                        className="toReviewDropdown"
                        placeholder="Select student"
                        fluid
                        search
                        selection
                        // options={this.props.dropdownUsers}
                        onChange={this.addCodeReview(1, data.id)}
                        value={this.props.codeReviewLogic.currentSelections[1][data.id]}
                      /> */}
                      </Table.Cell>
                      <Table.Cell>
                        {this.props.codeReviewLogic.showCreate ? (
                          <select className="toReviewDropdown" onChange={this.addCodeReview('create', data.id)}>
                            {this.props.dropdownUsers.map(
                              d =>
                                this.props.codeReviewLogic.currentSelections['create'][data.id] == d.value ? (
                                  <option selected="selected" key={d.value} value={d.value}>
                                    {d.text}
                                  </option>
                                ) : (
                                  <option key={d.value} value={d.value}>
                                    {d.text}
                                  </option>
                                )
                            )}
                            ))
                          </select>
                        ) : null}

                        {/* <Dropdown
                        className="toReviewDropdown"
                        placeholder="Select student"
                        fluid
                        search
                        selection
                        // options={this.props.dropdownUsers}
                        onChange={this.addCodeReview(2, data.id)}
                        value={this.props.codeReviewLogic.currentSelections[2][data.id]}
                      /> */}
                      </Table.Cell>
                    </Table.Row>
                  ))
                : null}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <Button compact onClick={this.selectAllCheckboxes()}>
                    ALL
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell>
                  <Button compact onClick={() => this.props.randomAssign({ reviewNumber: this.props.codeReviewLogic.selectedDropdown })} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit(this.props.codeReviewLogic.selectedDropdown)}>
                    Save
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell style={{ display: this.props.codeReviewLogic.showCreate ? '' : 'none' }}>
                  <Button compact onClick={() => this.props.randomAssign({ reviewNumber: 'create' })} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit('create')}>
                    Create
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </div>
        <Notification />
      </div>
    )
  }
}

export const userHelper = data => {
  let users = []
  if (data) {
    users.push({
      value: null,
      text: ''
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

const codeReviewHelper = data => {
  let codeReviews = []
  let i = 1
  while (i <= data) {
    codeReviews.push({
      value: i,
      text: `Codereview ${i}`
    })
    i++
  }
  return codeReviews
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    courseData: state.coursePage,
    selectedInstance: state.selectedInstance,
    codeReviewLogic: state.codeReviewLogic,
    dropdownUsers: userHelper(state.coursePage.data),
    dropdownCodeReviews: codeReviewHelper(state.selectedInstance.amountOfCodeReviews)
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
  codeReviewReset,
  selectDropdown,
  toggleCreate,
  createStates
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstanceReview)
