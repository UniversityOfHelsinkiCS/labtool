import React, { Component } from 'react'
import { Form, Input, Button, Grid, Radio } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
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
      if (!this.props.notification.error) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
  }

  state = {
    redirectToNewPage: false
  }

  handleChange = (e, { value }) => this.setState({ value })

  handleSubmit = async e => {
    try {
      e.preventDefault()

      const content = {
        weekAmount: e.target.weekAmount.value,
        weekMaxPoints: e.target.weeklyMaxpoints.value,
        currentWeek: e.target.currentWeek.value,
        active: e.target.courseActive.value,
        ohid: this.props.selectedInstance.ohid
      }
      await this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
      this.setState({ redirectToNewPage: true })
      this.forceUpdate()
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (this.state.redirectToNewPage) {
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

              <Form.Field inline>
                <Radio name="courseActive" label="Activate course" value="true" checked={this.state.value === 'true'} onChange={this.handleChange} style={{ width: '150px', textAlign: 'left' }} />
              </Form.Field>

              <Form.Field inline>
                <Radio name="courseActive" label="Deactivate course" value="false" checked={this.state.value === 'false'} onChange={this.handleChange} style={{ width: '150px', textAlign: 'left' }} />
              </Form.Field>

              <Form.Field>
                <Button type="Submit" floated="left" color="green">
                  Save
                </Button>

                <Link to="/labtool/courses">
                  <Button type="Cancel" floated="right">
                    Cancel
                  </Button>
                </Link>
              </Form.Field>
            </Form>
          </Grid.Row>
        </Grid>

        <Link to={`/labtool/ModifyCourseInstanceStaff/${this.props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '10px' }} floated="center">
            Add assistant teachers
          </Button>
        </Link>
        <Link to={`/labtool/ModifyCourseInstanceCodeReviews/${this.props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '10px' }} floated="center">
            Add or modify codereviews
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
    ownProps
  }
}

export default connect(mapStateToProps, { getOneCI, modifyOneCI, clearNotifications })(ModifyCourseInstancePage)
