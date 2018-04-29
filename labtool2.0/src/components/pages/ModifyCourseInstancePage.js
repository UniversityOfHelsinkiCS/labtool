import React, { Component } from 'react'
import { Form, Input, Button, Grid, Checkbox } from 'semantic-ui-react'
import { modifyOneCI } from '../../services/courseInstance'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
class ModifyCourseInstancePage extends Component {

  componentWillMount() {
    this.props.clearNotifications()
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

  handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const content = {
        weekAmount: e.target.weekAmount.value,
        weekMaxPoints: e.target.weeklyMaxpoints.value,
        currentWeek: e.target.currentWeek.value,
        active: e.target.courseActive.checked,
        ohid: this.props.selectedInstance.ohid
      }
      await this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
      this.setState({ redirectToNewPage: true })
    } catch (error) {
      console.log(error)
    }

  }

  render() {
    if (this.state.redirectToNewPage) {
      return (
        <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
      )
    }
    const selectedInstance = { ...this.props.selectedInstance }
    console.log('SE ON: ', selectedInstance)
    return (
      <div 
        className="CoursePage" 
        style={{ textAlignVertical: 'center', textAlign: 'center', }}>
       
        <Grid>
          <Grid.Row centered>
            <h2> Edit course: {selectedInstance.name} </h2>
          </Grid.Row>
        </Grid>


        <Grid>
          <Grid.Row centered>

            <Form onSubmit={this.handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>
                  Week amount
                </label>
                <Input
                  name="weekAmount"
                  required='true'
                  type="text"
                  style={{ maxWidth: '7em' }}
                  defaultValue={JSON.stringify(selectedInstance.weekAmount)}
                  className="form-control1" />
              </Form.Group>

              <Form.Group inline>
                <label
                  style={{ width: '125px', textAlign: 'left' }}>
                  Weekly maxpoints
                </label>
                <Input
                  name="weeklyMaxpoints"
                  required='true'
                  type="text"
                  style={{ maxWidth: '7em' }}
                  defaultValue={JSON.stringify(selectedInstance.weekMaxPoints)}
                  className="form-control2" />
              </Form.Group>

              <Form.Group inline>
                <label
                  style={{ width: '125px', textAlign: 'left' }}>
                  Current week
                </label>
                <Input
                  name="currentWeek"
                  required='true'
                  type="text"
                  style={{ maxWidth: '7em' }}
                  defaultValue={JSON.stringify(selectedInstance.currentWeek)}
                  className="form-control3" />
              </Form.Group>

              <Form.Group inline>
                <Checkbox
                  label='Course active'
                  className="form-control4"
                  name="courseActive"
                  defaultChecked={selectedInstance.active}
                  style={{ textAlign: 'left' }}
                />
              </Form.Group>

              <Form.Field>

                <Button
                  type='Submit'
                  floated='left'
                  color='green' >
                  Save
                </Button>

                <Link to="/labtool/courses">
                  <Button
                    type="Cancel"
                    floated='right' >
                    Cancel
                  </Button>
                </Link>

              </Form.Field>

            </Form>

          </Grid.Row>
        </Grid>
        
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance,
    notification: state.notification
  }
}

export default connect(mapStateToProps, { modifyOneCI, clearNotifications })(ModifyCourseInstancePage)