import React, { Component } from 'react'
import { Button, Form, Input, Grid, Card, Loader, Icon } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheck, resetChecklist } from '../../reducers/weekReviewReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'

/**
 *  The page which is used by teacher to review submissions,.
 */
export class ReviewStudent extends Component {
  constructor(props) {
    super(props)
    this.reviewPointsRef = React.createRef()
    this.reviewTextRef = React.createRef()
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.clearNotifications()
  }

  componentWillUnmount() {
    this.props.resetChecklist()
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        feedback: e.target.comment.value,
        weekNumber: this.props.weekNumber,
        checks: this.props.weekReview.checks
      }
      if (e.target.points.value < 0 || e.target.points.value > this.props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        this.props.addRedirectHook({
          hook: 'WEEKS_CREATE_ONE'
        })
        await this.props.createOneWeek(content)
      }
    } catch (error) {
      console.log(error)
    }
  }

  toggleCheckbox = (name, studentId, weekNbr) => async e => {
    this.props.toggleCheck(name, studentId, weekNbr)
  }

  copyChecklistOutput = async e => {
    e.preventDefault()
    this.reviewPointsRef.current.inputRef.value = e.target.points.value
    /* The below line is as hacky as it is because functional elements cannot directly have refs.
    * This abomination somehow accesses a textarea that is a child of a div that holds the ref.
    */
    this.reviewTextRef.current.children[0].children.comment.value = e.target.text.value
  }

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }
    if (this.props.loading.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }
    if (Array.isArray(this.props.weekReview.data)) {
      //this.props.ownProps.studentInstance is a string, therefore casting to number.
      const studentData = this.props.weekReview.data.filter(dataArray => dataArray.id === Number(this.props.ownProps.studentInstance))
      //this.props.weekNumber is a string, therefore casting to number.
      const weekData = studentData[0].weeks.filter(theWeek => theWeek.weekNumber === Number(this.props.ownProps.weekNumber))
      const checks = weekData[0] ? weekData[0].checks : {}
      const weekPoints = studentData[0].weeks
        .filter(week => week.weekNumber < this.props.weekNumber)
        .map(week => week.points)
        .reduce((a, b) => {
          return a + b
        }, 0)
      const codeReviewPoints = studentData[0].codeReviews.map(review => review.points).reduce((a, b) => {
        return a + b
      }, 0)
      const checkList = this.props.selectedInstance.checklists.find(checkl => checkl.week === Number(this.props.ownProps.weekNumber))
      let checklistOutput = ''
      let checklistPoints = 0
      if (checkList) {
        Object.keys(checkList.list).forEach(cl => {
          checkList.list[cl].forEach(row => {
            const isChecked = this.props.weekReview.checks[row.name] === undefined ? (checks[row.name] !== undefined ? checks[row.name] : false) : this.props.weekReview.checks[row.name]

            const addition = isChecked ? row.textWhenOn : row.textWhenOff
            if (addition) checklistOutput += addition + '\n\n'

            if (isChecked) {
              checklistPoints += row.checkedPoints
            } else {
              checklistPoints += row.uncheckedPoints
            }
          })
          if (checklistPoints < 0) {
            checklistPoints = 0
          } else if (checklistPoints > this.props.selectedInstance.weekMaxPoints) {
            checklistPoints = this.props.selectedInstance.weekMaxPoints
          }
        })
      }
      return (
        <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <h2> {this.props.selectedInstance.name}</h2>
          <h3>
            {' '}
            {studentData[0].User.firsts} {studentData[0].User.lastname}{' '}
          </h3>
          {this.props.weekNumber > this.props.selectedInstance.weekAmount ? <h3>Final Review</h3> : <h3>Viikko {this.props.weekNumber}</h3>}
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                {this.props.weekNumber > this.props.selectedInstance.weekAmount ? (
                  <div align="left">
                    <h3>Points before final review: {weekPoints + codeReviewPoints} </h3>
                    Week points: {weekPoints} <br />
                    Code review points: {codeReviewPoints}
                  </div>
                ) : (
                  <div align="left">
                    <h3>Points from previous weeks: {weekPoints + codeReviewPoints} </h3>
                    Week points: {weekPoints} <br />
                    Code review points: {codeReviewPoints}
                  </div>
                )}
                {this.props.weekNumber > this.props.selectedInstance.weekAmount ? <h2>Final Review Points</h2> : <h2>Feedback</h2>}
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group inline unstackable>
                    <Form.Field>
                      <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>

                      <Input ref={this.reviewPointsRef} name="points" defaultValue={weekData[0] ? weekData[0].points : ''} type="number" step="0.01" style={{ width: '150px', align: 'center' }} />
                    </Form.Field>
                  </Form.Group>
                  <label> Feedback </label>
                  <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                    <div ref={this.reviewTextRef}>
                      {/*Do not add anything else to this div. If you do, you'll break this.copyChecklistOutput.*/}
                      <Form.TextArea defaultValue={weekData[0] ? weekData[0].feedback : ''} name="comment" style={{ width: '500px', height: '250px' }} />
                    </div>
                  </Form.Group>
                  <Form.Field>
                    <Button className="ui center floated green button" type="submit">
                      Save
                    </Button>
                    <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${studentData[0].id}`} type="Cancel">
                      <Button className="ui center floated button" type="cancel">
                        Cancel
                      </Button>
                    </Link>
                  </Form.Field>
                </Form>
              </Grid.Column>
              {checkList && checks !== undefined ? (
                <Grid.Column>
                  <h2>Checklist</h2>
                  {checkList ? (
                    <div className="checklist">
                      {Object.keys(checkList.list).map(cl => (
                        <Card className="checklistCard" fluid color="red" key={cl}>
                          <Card.Content header={cl} />
                          {checkList.list[cl].map(row => (
                            <Card.Content className="checklistCardRow" key={row.name}>
                              <Form.Field>
                                <Input
                                  type="checkbox"
                                  defaultChecked={checks[row.name] !== undefined ? checks[row.name] : false}
                                  onChange={this.toggleCheckbox(row.name, this.props.ownProps.studentInstance, this.props.ownProps.weekNumber)}
                                />
                                <span>{row.name}</span>
                                <div style={{ marginLeft: '20px', display: 'inline-block', maxWidth: '0px', textAlign: 'left' }}>
                                  <span style={{ display: 'inline-block', minWidth: '100px' }}>
                                    <Icon className="grey check square outline" />
                                    {row.checkedPoints} p
                                  </span>
                                  <span style={{ display: 'inline-block', minWidth: '100px' }}>
                                    <Icon className="grey square outline" />
                                    {row.uncheckedPoints} p
                                  </span>
                                </div>
                              </Form.Field>
                            </Card.Content>
                          ))}
                        </Card>
                      ))}
                      <div>
                        <Form className="checklistOutput" onSubmit={this.copyChecklistOutput}>
                          <Form.TextArea className="checklistOutputText" name="text" value={checklistOutput} style={{ width: '100%', height: '250px' }} />
                          <p className="checklistOutputPoints">points: {checklistPoints}</p>
                          <input type="hidden" name="points" value={checklistPoints} />
                          <Button type="submit">Copy to review fields</Button>
                        </Form>
                      </div>
                    </div>
                  ) : (
                    <p>There is no checklist for this week.</p>
                  )}
                </Grid.Column>
              ) : (
                <div />
              )}
            </Grid.Row>
          </Grid>
        </div>
      )
    } else {
      return <Loader active />
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    courseData: state.coursePage,
    weekReview: state.weekReview,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createOneWeek,
  getOneCI,
  clearNotifications,
  toggleCheck,
  resetChecklist,
  coursePageInformation,
  resetLoading,
  addRedirectHook
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewStudent)
