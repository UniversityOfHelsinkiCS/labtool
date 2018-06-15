import React from 'react'
import { connect } from 'react-redux'
import { getOneCI } from '../../services/courseInstance'
import { insertCodeReviews } from '../../services/codeReview'
import { coursePageInformation } from '../../services/courseInstance'
import { bulkinsertCodeReviews } from '../../services/codeReview'
import { codeReviewReducer, initOneReview, initOrRemoveRandom, initCheckbox, initAllCheckboxes, randomAssign, codeReviewReset } from '../../reducers/codeReviewReducer'
import { filterByTag } from '../../reducers/coursePageLogicReducer'
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

  handleSubmit = reviewNumber => async e => {
    try {
      e.preventDefault()
      const codeReviews = this.props.codeReviewLogic.codeReviewStates[reviewNumber]
      console.log(codeReviews)
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

  changeFilterTag = id => {
    return () => {
      if (this.props.coursePageLogic.filterByTag === id) {
        this.props.filterByTag(0)
      } else {
        this.props.filterByTag(id)
      }
    }
  }

  hasFilteredTag = (data, id) => {
    for (let i = 0; i < data.Tags.length; i++) {
      if (data.Tags[i].id === id) {
        return data
      }
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
                <Table.HeaderCell>
                  Project Info
                  {this.props.coursePageLogic.filterByTag !== 0 ? (
                    <Button compact className="mini ui yellow button" floated="right" onClick={this.changeFilterTag(0)}>
                      Clear tag filter
                    </Button>
                  ) : (
                    <p />
                  )}
                </Table.HeaderCell>
                <Table.HeaderCell key={1}>Code Review 1 </Table.HeaderCell>
                <Table.HeaderCell key={2}>Code Review 2 </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData.data !== undefined
                ? this.props.courseData.data
                    .filter(data => {
                      return this.props.coursePageLogic.filterByTag === 0 || this.hasFilteredTag(data, this.props.coursePageLogic.filterByTag)
                    })
                    .map(data => (
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
                          <p>
                            {data.projectName}
                            <br />
                            <a href={data.github}>{data.github}</a>
                          </p>
                          {data.Tags.map(tag => (
                            <div key={tag.id}>
                              <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={this.changeFilterTag(tag.id)}>
                                {tag.name}
                              </Button>
                            </div>
                          ))}
                        </Table.Cell>
                        <Table.Cell>
                          <p>Current review: {getCurrentReviewer(1, data.id)}</p>
                          <select className="toReviewDropdown" onChange={this.addCodeReview(1, data.id)}>
                            {this.props.dropdownUsers.map(d => (
                              <option key={d.value} value={d.value}>
                                {d.text}
                              </option>
                            ))}
                          </select>
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
                          <p>Current review: {getCurrentReviewer(2, data.id)}</p>
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
                          <select className="toReviewDropdown" onChange={this.addCodeReview(2, data.id)}>
                            {this.props.dropdownUsers.map(d => (
                              <option key={d.value} value={d.value}>
                                {d.text}
                              </option>
                            ))}
                          </select>
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
                <Table.HeaderCell>
                  <Button compact onClick={() => this.props.randomAssign({ reviewNumber: 1 })} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit(1)}>
                    Save
                  </Button>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <Button compact onClick={() => this.props.randomAssign({ reviewNumber: 2 })} size="small" style={{ float: 'left' }}>
                    Assign selected randomly
                  </Button>
                  <Button compact size="small" style={{ float: 'right' }} onClick={this.handleSubmit(2)}>
                    Save
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

const mapStateToProps = (state, ownProps) => {
  return {
    courseId: ownProps.courseId,
    courseData: state.coursePage,
    selectedInstance: state.selectedInstance,
    codeReviewLogic: state.codeReviewLogic,
    coursePageLogic: state.coursePageLogic,
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
  codeReviewReset,
  filterByTag
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyCourseInstanceReview)
