import React, { Component } from 'react'
import { Button, Form, Input, Grid, Card } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheck, resetChecklist } from '../../reducers/weekReviewReducer'
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

  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.clearNotifications()
  }

  componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
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
        weekNumber: this.props.weekNumber
      }
      if (e.target.points.value < 0 || e.target.points.value > this.props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        await this.props.createOneWeek(content)
      }
    } catch (error) {
      console.log(error)
    }
  }

  toggleCheckbox = name => async e => {
    this.props.toggleCheck(name)
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
      return <p>Loading</p>
    }
    //this.props.ownProps.studentInstance is a string, therefore casting to number.
    const studentData = this.props.courseData.data.filter(dataArray => dataArray.id === Number(this.props.ownProps.studentInstance))
    //this.props.weekNumber is a string, therefore casting to number.
    const weekData = studentData[0].weeks.filter(theWeek => theWeek.weekNumber === Number(this.props.ownProps.weekNumber))
    const checkList = this.props.selectedInstance.checklists.find(checkl => checkl.week == this.props.ownProps.weekNumber)
    let checklistOutput = ''
    let checklistPoints = 0
    if (checkList) {
      Object.keys(checkList.list).forEach(cl => {
        checkList.list[cl].forEach(row => {
          const addition = this.props.weekReview.checks[row.name] ? row.textWhenOn : row.textWhenOff
          if (addition) checklistOutput += addition + '\n\n'
          if (this.props.weekReview.checks[row.name]) {
            checklistPoints += row.points
          }
        })
      })
      if (checklistPoints < 0) {
        checklistPoints = 0
      } else if (checklistPoints > this.props.selectedInstance.weekMaxPoints) {
        checklistPoints = this.props.selectedInstance.weekMaxPoints
      }
    }

    return (
      <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <h2> {this.props.selectedInstance.name}</h2>
        <h3>
          {' '}
          {studentData[0].User.firsts} {studentData[0].User.lastname}{' '}
        </h3>
        <h3> Viikko {this.props.weekNumber} </h3>
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column>
              <h2>Feedback</h2>
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
                            <label>{row.name} </label>
                            <Input type="checkbox" onChange={this.toggleCheckbox(row.name)} />
                            <label> {row.points} p</label>
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
          </Grid.Row>
        </Grid>
      </div>
    )
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

export default connect(
  mapStateToProps,
  { createOneWeek, getOneCI, clearNotifications, toggleCheck, resetChecklist, coursePageInformation }
)(ReviewStudent)
