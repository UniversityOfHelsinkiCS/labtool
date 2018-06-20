import React, { Component } from 'react'
import { Form, Input, Button, Grid, Checkbox, Loader } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'

/**
 *  Page used to modify a courseinstances information. Can only be accessed by teachers.
 */
export class ModifyCourseInstancePage extends Component {
  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.clearNotifications()
    this.props.getOneCI(this.props.courseId)
  }

  changeField = async e => {
    this.props.changeCourseField({
      field: e.target.name,
      value: e.target.value
    })
  }

  handleChange = async e => {
    this.props.changeCourseField({
      field: 'active',
      value: !this.props.selectedInstance.active
    })
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()
      const { weekAmount, weekMaxPoints, currentWeek, active, ohid } = this.props.selectedInstance
      const content = {
        weekAmount,
        weekMaxPoints,
        currentWeek,
        active,
        ohid
      }
      this.props.addRedirectHook({
        hook: 'CI_MODIFY_ONE_'
      })
      this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (this.props.loading.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }
    const selectedInstance = { ...this.props.selectedInstance }
    return (
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <Loader active={this.props.loading.loading} inline="centered" />
        <Grid>
          <Grid.Row centered>
            <h2> Edit course: {selectedInstance.name} </h2>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Week amount</label>
                <Input name="weekAmount" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekAmount} className="form-control1" onChange={this.changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Weekly maxpoints</label>
                <Input name="weekMaxPoints" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekMaxPoints} className="form-control2" onChange={this.changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Current week</label>
                <Input name="currentWeek" required="true" type="text" style={{ maxWidth: '7em' }} value={selectedInstance.currentWeek} className="form-control3" onChange={this.changeField} />
              </Form.Group>

              <Form.Field inline>
                <Checkbox name="courseActive" label="Activate course" checked={selectedInstance.active} onChange={this.handleChange} style={{ width: '150px', textAlign: 'left' }} />
              </Form.Field>

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
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px'  }} block="true">
            Add or modify codereviews
          </Button>
        </Link>
        <Link to={`/labtool/checklist/${this.props.selectedInstance.ohid}/create`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px'  }} block="true">
            Create new checklist
          </Button>
        </Link>
        <Link to={`/labtool/managetags`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px'  }} block="true">
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
    loading: state.loading,
    ownProps
  }
}

const mapDispatchToProps = {
  getOneCI,
  modifyOneCI,
  clearNotifications,
  changeCourseField,
  resetLoading,
  addRedirectHook
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstancePage)
