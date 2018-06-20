import React, { Component } from 'react'
<<<<<<< HEAD
import { Form, Input, Button, Grid, Radio, Dropdown, Popup } from 'semantic-ui-react'
=======
import { Form, Input, Button, Grid, Checkbox, Loader } from 'semantic-ui-react'
>>>>>>> 3d97c62c39990a98eaf1a6f16e74cc93896c13ef
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
<<<<<<< HEAD
  constructor(props) {
    super(props)
    this.state = {
      toRemoveCr: [],
      toAddCr: []
    }
  }

  componentWillMount() {
=======
  componentWillMount = async () => {
    await this.props.resetLoading()
>>>>>>> 3d97c62c39990a98eaf1a6f16e74cc93896c13ef
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

<<<<<<< HEAD
  handleRemoveChange = (e, { value }) => {
    e.preventDefault()
    this.setState({ toRemoveCr: this.state.toRemoveCr.includes(value) ? this.state.toRemoveCr.filter(cr => cr !== value) : [...this.state.toRemoveCr, value] })
  }

  handleAddChange = (e, { value }) => {
    e.preventDefault()
    this.setState({ toAddCr: value })
  }

  handleChange = (e, { value }) => this.setState({ value })

  handleSubmit = async e => {
    try {
      e.preventDefault()

      let newCr = this.props.selectedInstance.currentCodeReview.filter(cr => !this.state.toRemoveCr.includes(cr))
      newCr = newCr.concat(this.state.toAddCr)
      console.log(newCr)
      const content = {
        weekAmount: e.target.weekAmount.value,
        weekMaxPoints: e.target.weeklyMaxpoints.value,
        currentWeek: e.target.currentWeek.value,
        active: e.target.courseActive.value,
        ohid: this.props.selectedInstance.ohid,
        newCr: newCr
=======
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
>>>>>>> 3d97c62c39990a98eaf1a6f16e74cc93896c13ef
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
<<<<<<< HEAD

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

=======
>>>>>>> 3d97c62c39990a98eaf1a6f16e74cc93896c13ef
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

            <Form.Group inline>
              <label style={{ width: '125px', textAlign: 'left' }}>Currently visible code reviews</label>
              {this.props.selectedInstance.currentCodeReview
                ? this.props.selectedInstance.currentCodeReview.map(
                  cr =>
                    this.state.toRemoveCr.includes(cr) ? (
                      <Popup
                        key={cr}
                        trigger={
                          <Button className="nappisaatana" color="red" value={cr} onClick={this.handleRemoveChange} compact>
                            {cr}
                          </Button>
                        }
                        content={'Click to not be removed on save'}
                      />
                    ) : (
                        <Popup
                          key={cr}
                          trigger={
                            <Button value={cr} onClick={this.handleRemoveChange} compact>
                              {cr}
                            </Button>
                          }
                          content={'Click to be removed on save'}
                        />
                      )
                )
                : null}
            </Form.Group>

            <Form.Field inline>
              <Dropdown onChange={this.handleAddChange} options={this.props.codeReviewDropdowns} fluid multiple placeholder="Select code review to set visible" />
            </Form.Field>

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
      </div >
    )
  }
}

const createDropdownCodereviews = (amount, current) => {
  let ddCr = []
  let i = 1
  if (amount && current) {
    while (i <= amount) {
      if (!current.includes(i)) {
        ddCr.push({
          value: i,
          text: `Codereview ${i}`
        })
      }
      i++
    }
  }
  return ddCr
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance,
    notification: state.notification,
    ownProps,
    codeReviewDropdowns: createDropdownCodereviews(state.selectedInstance.amountOfCodeReviews, state.selectedInstance.currentCodeReview),
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
