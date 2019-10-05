import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Grid, Dropdown, Checkbox, Loader, Popup } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { setFinalReview } from '../../reducers/selectedInstanceReducer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { clearNotifications } from '../../reducers/notificationReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import useLegacyState from '../../hooks/legacyState'

import BackButton from '../BackButton'

/**
 *  Page used to modify a courseinstances information. Can only be accessed by teachers.
 */
export const ModifyCourseInstancePage = props => {
  const state = useLegacyState({
    toRemoveCr: [],
    toAddCr: []
  })

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.clearNotifications()
    props.getOneCI(props.courseId)
  }, [])

  const changeField = async e => {
    props.changeCourseField({
      field: e.target.name,
      value: e.target.value
    })
  }

  const handleChange = async () => {
    props.changeCourseField({
      field: 'active',
      value: !props.selectedInstance.active
    })
  }

  const changeFinalReview = () => {
    const newValue = !props.selectedInstance.finalReview
    props.setFinalReview(newValue)
  }

  const handleRemoveChange = (e, { value }) => {
    e.preventDefault()
    state.toRemoveCr = state.toRemoveCr.includes(value) ? state.toRemoveCr.filter(cr => cr !== value) : [...state.toRemoveCr, value]
  }

  const handleAddChange = (e, { value }) => {
    e.preventDefault()
    state.toAddCr = value
  }

  const handleSubmit = async e => {
    try {
      e.preventDefault()

      let newCr = props.selectedInstance.currentCodeReview.filter(cr => !state.toRemoveCr.includes(cr))
      newCr = newCr.concat(state.toAddCr)
      const { weekAmount, weekMaxPoints, currentWeek, active, ohid, finalReview, coursesPage, courseMaterial } = props.selectedInstance
      const content = {
        weekAmount,
        weekMaxPoints,
        currentWeek,
        active,
        ohid,
        finalReview,
        newCr,
        coursesPage,
        courseMaterial
      }
      props.addRedirectHook({
        hook: 'CI_MODIFY_ONE_'
      })
      props.modifyOneCI(content, props.selectedInstance.ohid)
    } catch (error) {
      console.error(error)
    }
  }

  if (props.redirect && props.redirect.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }
  const selectedInstance = { ...props.selectedInstance }
  return (
    <div>
      <BackButton preset="coursePage" />
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <Loader active={props.loading.loading} inline="centered" />
        <Grid>
          <Grid.Row centered>
            <h2> Edit course: {selectedInstance.name} </h2>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row centered>
            <Form onSubmit={handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Week amount</label>
                <Input name="weekAmount" required={true} type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekAmount} className="form-control1" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Weekly maxpoints</label>
                <Input name="weekMaxPoints" required={true} type="text" style={{ maxWidth: '7em' }} value={selectedInstance.weekMaxPoints} className="form-control2" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Current week</label>
                <Input name="currentWeek" required={true} type="text" style={{ maxWidth: '7em' }} value={selectedInstance.currentWeek} className="form-control3" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Link to courses.helsinki.fi</label>
                <Input name="coursesPage" type="text" style={{ maxWidth: '12em' }} value={selectedInstance.coursesPage} className="form-control4" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Link to course material</label>
                <Input name="courseMaterial" type="text" style={{ maxWidth: '12em' }} value={selectedInstance.courseMaterial} className="form-control5" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Currently visible code reviews</label>
                {props.selectedInstance.currentCodeReview
                  ? props.selectedInstance.currentCodeReview
                      .sort((a, b) => {
                        return a - b
                      })
                      .map(cr =>
                        state.toRemoveCr.includes(cr) ? (
                          <Popup
                            key={cr}
                            trigger={
                              <Button color="red" value={cr} onClick={handleRemoveChange} compact>
                                {cr}
                              </Button>
                            }
                            content={'This code review will be hidden on save'}
                          />
                        ) : (
                          <Popup
                            key={cr}
                            trigger={
                              <Button value={cr} onClick={handleRemoveChange} compact>
                                {cr}
                              </Button>
                            }
                            content={'Click to hide this code review on save'}
                          />
                        )
                      )
                  : null}
              </Form.Group>
              <Form.Group inline>
                <Dropdown
                  onChange={handleAddChange}
                  options={props.codeReviewDropdowns}
                  fluid
                  selection
                  multiple={true}
                  placeholder={props.selectedInstance.amountOfCodeReviews > 0 ? 'Select code reviews to set visible' : 'No code reviews'}
                />
              </Form.Group>

              <Form.Group inline>
                <Checkbox
                  name="finalReview"
                  checked={props.selectedInstance.finalReview}
                  onChange={changeFinalReview}
                  label="Course has a final review"
                  style={{ width: '150px', textAlign: 'left' }}
                />
              </Form.Group>

              <Form.Group inline>
                <Checkbox name="courseActive" label="Activate course" checked={selectedInstance.active} onChange={handleChange} style={{ width: '150px', textAlign: 'left' }} />
              </Form.Group>

              <Form.Group style={{ display: 'inline-block', marginLeft: 'auto', marginRight: 'auto' }}>
                <Button type="Submit" color="green" size="huge">
                  Save
                </Button>

                <Link to="/labtool/courses">
                  <Button type="Cancel" color="red" size="huge">
                    Cancel
                  </Button>
                </Link>
              </Form.Group>
            </Form>
          </Grid.Row>
        </Grid>

        <Link to={`/labtool/ModifyCourseInstanceStaff/${props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Manage assistant teachers
          </Button>
        </Link>
        <Link to={`/labtool/ModifyCourseInstanceCodeReviews/${props.selectedInstance.ohid}`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Edit code reviews
          </Button>
        </Link>
        <Link to={`/labtool/checklist/${props.selectedInstance.ohid}/create`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Edit checklists
          </Button>
        </Link>
        <Link to={`/labtool/managetags`}>
          <Button style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px' }} block="true">
            Edit tags
          </Button>
        </Link>
      </div>
    </div>
  )
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
    redirect: state.redirect
  }
}

const mapDispatchToProps = {
  getOneCI,
  modifyOneCI,
  clearNotifications,
  changeCourseField,
  resetLoading,
  addRedirectHook,
  setFinalReview
}

ModifyCourseInstancePage.propTypes = {
  courseId: PropTypes.string.isRequired,

  selectedInstance: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  codeReviewDropdowns: PropTypes.array,
  loading: PropTypes.object.isRequired,
  redirect: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  modifyOneCI: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  changeCourseField: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,
  setFinalReview: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstancePage)
