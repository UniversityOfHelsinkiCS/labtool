import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import store from '../../store'
class ReviewStudent extends Component {
<<<<<<< HEAD
  componentWillMount() {
    this.props.clearNotifications()
  }

  componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error) {
        this.props.history.push(<Link to={`/labtool/courses/${this.props.selectedInstance.ohid}`} > <button className="ui right floated button" type="Cancel">Cancel</button></Link>)
      }
    }
  }
=======
>>>>>>> cf6cd4f9be6b660ae0188f0bf43357af6ce95846

  state = {
    redirectToNewPage: false
  }


  handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        comment: e.target.comment.value,
        weekNumber: this.props.weekNumber
      }
      if (e.target.points.value < 0 || e.target.points.value > this.props.selectedInstance.weekMaxPoints) {
        store.dispatch({ type: 'WEEKS_CREATE_ONEFAILURE' })
      } else {
        await this.props.createOneWeek(content)
      }

    } catch (error) {
    }
    this.setState({ redirectToNewPage: true })

  }
  render() {
    if (this.state.redirectToNewPage) {
      return (
        <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
      )
    }
    return (
      <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> Tiralabra 2018 Kevät</h2>
        <h3> Viikko {this.props.weekNumber} </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable >
              <Form.Field >
                <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>
                <Input name="points" />
              </Form.Field>
            </Form.Group>
            <Form.Group inline unstackable>
              <label> Comment </label>
              <Form.TextArea name="comment" />
            </Form.Group>
            <Form.Field>
              <Button className="ui left floated green button" type='submit'>Save</Button>
              <Link to={`/labtool/courses/${this.props.selectedInstance.ohid}`} type = "Cancel" >
                <Button className="ui right floated button" type="cancel">Cancel</Button>
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
    selectedInstance: state.selectedInstance
  }
}

export default connect(mapStateToProps, { createOneWeek, clearNotifications })(ReviewStudent)

