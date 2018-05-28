import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { getOneCI } from '../../services/courseInstance'
import { clearNotifications } from '../../reducers/notificationReducer'
import store from '../../store'

/**
 *  The page which is used by teacher to review submissions,.
 */
class ReviewStudent extends Component {
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
  render() {
    var pointsAndComment = JSON.parse(localStorage.getItem('points and comment'))
    localStorage.removeItem('points and comment')
    console.log('pointsAndComment Review student: ', pointsAndComment)
    var points = null
    var comment = null
    if (pointsAndComment !== null) {
      points = pointsAndComment.points
      comment = pointsAndComment.comment
    }
    return (
      <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <h2> {this.props.selectedInstance.name}</h2>
        <h3> Viikko {this.props.weekNumber} </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable>
              <Form.Field>
                <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>
                <Input name="points" value={points} type="number" step="0.01" />
              </Form.Field>
            </Form.Group>
            <Form.Group inline unstackable>
              <label> Feedback </label>
              <Form.TextArea value={comment} name="comment" />
            </Form.Group>
            <Form.Field>
              <Button className="ui left floated green button" type="submit">
                Save
              </Button>
              <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${this.props.courseData.data[0].id}`} type="Cancel">
                <Button className="ui right floated button" type="cancel">
                  Cancel
                </Button>
              </Link>
            </Form.Field>
          </Form>
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
    courseData: state.coursePage
  }
}

export default connect(mapStateToProps, { createOneWeek, getOneCI, clearNotifications })(ReviewStudent)
