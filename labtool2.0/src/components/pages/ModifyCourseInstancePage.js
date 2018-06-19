import React, { Component } from 'react'
import { Form, Input, Button, Grid, Radio, Checkbox } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { setActive, setFinalReview } from '../../reducers/selectedInstanceReducer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'

/**
 *  Page used to modify a courseinstances information. Can only be accessed by teachers.
 */
export class ModifyCourseInstancePage extends Component {
  componentWillMount() {
    this.props.clearNotifications()
    this.props.getOneCI(this.props.courseId)
  }

  componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error && this.props.history) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
  }

  changeActive = () => {
    const newValue = this.props.selectedInstance.active !== true
    this.props.setActive(newValue)
  }

  changeFinalReview = () => {
    const newValue = this.props.selectedInstance.finalReview !== true
    this.props.setFinalReview(newValue)
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()

      const content = {
        weekAmount: e.target.weekAmount.value,
        weekMaxPoints: e.target.weeklyMaxpoints.value,
        currentWeek: e.target.currentWeek.value,
        active: this.props.selectedInstance.active,
        ohid: this.props.selectedInstance.ohid,
        finalReview: this.props.selectedInstance.finalReview
      }
      await this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
      this.forceUpdate()
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (this.props.redirect && this.props.redirect.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }
    const selectedInstance = { ...this.props.selectedInstance }
    return (
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <Grid>
          <Grid.Row centered>
            <h2> Edit course: {selectedInstance.name} </h2>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            {selectedInstance.active === true ? (
              <div>
                <Grid.Row>
                  <h4 style={{ color: '#21ba45' }}>This course is currently activated.</h4>
                </Grid.Row>
              </div>
            ) : (
              <div>
                <Grid.Row>
                  <h4 style={{ color: 'grey' }}>This course is currently passive.</h4>
                </Grid.Row>
              </div>
            )}
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Week amount</label>
                <Input name="weekAmount" required="true" type="text" style={{ maxWidth: '7em' }} defaultValue={JSON.stringify(selectedInstance.weekAmount)} className="form-control1" />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Weekly maxpoints</label>
                <Input name="weeklyMaxpoints" required="true" type="text" style={{ maxWidth: '7em' }} defaultValue={JSON.stringify(selectedInstance.weekMaxPoints)} className="form-control2" />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Current week</label>
                <Input name="currentWeek" required="true" type="text" style={{ maxWidth: '7em' }} defaultValue={JSON.stringify(selectedInstance.currentWeek)} className="form-control3" />
              </Form.Group>

              <Form.Group inline>
                <Checkbox
                  name="finalReview"
                  checked={this.props.selectedInstance.finalReview}
                  onChange={this.changeFinalReview}
                  label="Course has a final review"
                  style={{ width: '150px', textAlign: 'left' }}
                />
              </Form.Group>

              <Form.Group inline>
                <Checkbox name="courseActive" checked={this.props.selectedInstance.active} onChange={this.changeActive} label="Course is active" style={{ width: '150px', textAlign: 'left' }} />
              </Form.Group>

              <Form.Field>
                <Button type="Submit" floated="left" color="green" size="huge">
                  Save
                </Button>

                <Link to="/labtool/courses">
                  <Button type="Cancel" floated="right" color="red" size="huge">
                    Cancel
                  </Button>
                </Link>
              </Form.Field>
            </Form>
          </Grid.Row>
        </Grid>

        <Link to={`/labtool/ModifyCourseInstanceStaff/${this.props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Add or remove assistant teachers
          </Button>
        </Link>
        <Link to={`/labtool/ModifyCourseInstanceCodeReviews/${this.props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Add or modify codereviews
          </Button>
        </Link>
        <Link to={`/labtool/checklist/${this.props.selectedInstance.ohid}/create`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Create new checklist
          </Button>
        </Link>
        <Link to={`/labtool/managetags`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Edit tags
          </Button>
        </Link>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    redirect: state.redirect,
    ownProps
  }
}

export default connect(
  mapStateToProps,
  { getOneCI, modifyOneCI, clearNotifications, setActive, setFinalReview }
)(ModifyCourseInstancePage)
