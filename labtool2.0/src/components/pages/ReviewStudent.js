import React, { Component } from 'react'
import { Button, Form, Input, Grid, Card, TextArea } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { getOneCI } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import { toggleCheck } from '../../reducers/weekReviewReducer'
import store from '../../store'

/**
 *  The page which is used by teacher to review submissions,.
 */
export class ReviewStudent extends Component {
  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.clearNotifications()
  }

  componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
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

  render() {
    //this.props.ownProps.studentInstance is a string, therefore casting to number.
    const studentData = this.props.courseData.data.filter(dataArray => dataArray.id === Number(this.props.ownProps.studentInstance))
    //this.props.weekNumber is a string, therefore casting to number.
    const weekData = studentData[0].weeks.filter(theWeek => theWeek.weekNumber === Number(this.props.ownProps.weekNumber))
    const checkList = this.props.selectedInstance.checklists.find(checkl => checkl.week == this.props.ownProps.weekNumber)
    let checklistOutput = ''
    let checklistPoints = 0
    Object.keys(checkList.list).forEach(cl => {
      checkList.list[cl].forEach(row => {
        const addition = this.props.weekReview.checks[row.name] ? row.textWhenOn : row.textWhenOff
        if (addition) checklistOutput += addition + '\n'
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

                    <Input name="points" defaultValue={weekData[0] ? weekData[0].points : ''} type="number" step="0.01" style={{ width: '150px', align: 'center' }} />
                  </Form.Field>
                </Form.Group>
                <label> Feedback </label>
                <Form.Group inline unstackable style={{ textAlignVertical: 'top' }}>
                  <Form.TextArea defaultValue={weekData[0] ? weekData[0].feedback : ''} name="comment" style={{ width: '500px', height: '250px' }} />
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
              <h2 className="checklist">Checklist</h2>
              {checkList ? (
                <div>
                  {Object.keys(checkList.list).map(cl => (
                    <Card fluid color="red" key={cl}>
                      <Card.Content header={cl} />
                      {checkList.list[cl].map(row => (
                        <Card.Content key={row.name}>
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
                    <TextArea value={checklistOutput} />
                    <p>points: {checklistPoints}</p>
                  </div>
                </div>
              ) : (
                <p>nada</p>
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
    weekReview: state.weekReview
  }
}

export default connect(
  mapStateToProps,
  { createOneWeek, getOneCI, clearNotifications, toggleCheck }
)(ReviewStudent)
