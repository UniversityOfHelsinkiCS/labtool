import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Grid, Dropdown, Checkbox, Loader, Popup } from 'semantic-ui-react'
import { getOneCI, modifyOneCI } from '../../services/courseInstance'
import { setFinalReview } from '../../reducers/selectedInstanceReducer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'
import { showNotification, clearNotifications } from '../../reducers/notificationReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { forceRedirect } from '../../reducers/redirectReducer'
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

  useEffect(() => {
    if (props.selectedInstance.currentWeek !== null) {
      const possibleValues = createDropdownWeeks().map(option => option.value)
      if (!possibleValues.includes(props.selectedInstance.currentWeek)) {
        console.log('reset')
        props.changeCourseField({ field: 'currentWeek', value: null })
      }
    }
  }, [props.selectedInstance.weekAmount, props.selectedInstance.finalReview, props.selectedInstance.currentWeek])

  const changeField = e => {
    props.changeCourseField({
      field: e.target.name,
      value: e.target.value
    })
  }

  const changeDropdown = field => (e, { value }) => {
    props.changeCourseField({
      field,
      value
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

      if (currentWeek === null || !dropdownWeeks.map(option => option.value).includes(currentWeek)) {
        props.showNotification({
          message: 'You must select a week first!',
          error: true
        })
        return
      }

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
      props.changeCourseField({
        field: 'active',
        value: active
      })
      props.addRedirectHook({
        hook: 'CI_MODIFY_ONE_'
      })
      props.modifyOneCI(content, props.selectedInstance.ohid)
    } catch (error) {
      console.error(error)
    }
  }

  const createDropdownWeeks = () => {
    const options = []

    for (let i = 1; i <= props.selectedInstance.weekAmount; i++) {
      options.push({
        key: i,
        text: `Week ${i}`,
        value: i
      })
    }

    if (props.selectedInstance.finalReview) {
      options.push({
        key: props.selectedInstance.weekAmount + 1,
        text: 'Final Review',
        value: props.selectedInstance.weekAmount + 1
      })
    }

    return options
  }

  if ((props.redirect && props.redirect.redirect) || props.loading.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }
  const selectedInstance = { ...props.selectedInstance }
  const dropdownWeeks = createDropdownWeeks()

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
                <Input name="weekAmount" type="number" min={1} required={true} style={{ maxWidth: '7em' }} value={selectedInstance.weekAmount} className="form-control1" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Maximum week points</label>
                <Input name="weekMaxPoints" type="number" min={0} required={true} style={{ maxWidth: '7em' }} value={selectedInstance.weekMaxPoints} className="form-control2" onChange={changeField} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Current week</label>

                <Dropdown
                  className="weekDropdown"
                  onChange={changeDropdown('currentWeek')}
                  style={{ maxWidth: '12em' }}
                  options={dropdownWeeks}
                  fluid
                  required={true}
                  selection
                  placeholder="Select week!"
                  value={selectedInstance.currentWeek}
                />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Link to courses.helsinki.fi</label>
                <Input
                  name="coursesPage"
                  type="text"
                  style={{ maxWidth: '12em' }}
                  value={selectedInstance.coursesPage === null ? '' : selectedInstance.coursesPage}
                  className="form-control4"
                  onChange={changeField}
                />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Link to course material</label>
                <Input
                  name="courseMaterial"
                  type="text"
                  style={{ maxWidth: '12em' }}
                  value={selectedInstance.courseMaterial === null ? '' : selectedInstance.courseMaterial}
                  className="form-control5"
                  onChange={changeField}
                />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '125px', textAlign: 'left' }}>Currently visible code reviews</label>
                {props.selectedInstance.currentCodeReview && props.selectedInstance.currentCodeReview.sort
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
                  className="codeReviewDropdown"
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
                <Checkbox name="courseActive" label="Course registration is active" checked={selectedInstance.active} onChange={handleChange} style={{ width: '150px', textAlign: 'left' }} />
              </Form.Group>

              <Form.Group style={{ display: 'inline-block', marginLeft: 'auto', marginRight: 'auto' }}>
                <Button type="Submit" color="green" size="huge">
                  Save
                </Button>

                <Link to={`/labtool/courses/${props.selectedInstance.ohid}`}>
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

const createDropdownCodeReviews = (amount, current) => {
  let ddCr = []
  let i = 1
  if (amount && current) {
    while (i <= amount) {
      if (!current.includes(i)) {
        ddCr.push({
          value: i,
          text: `Code Review ${i}`
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
    codeReviewDropdowns: createDropdownCodeReviews(state.selectedInstance.amountOfCodeReviews, state.selectedInstance.currentCodeReview),
    loading: state.loading,
    redirect: state.redirect
  }
}

const mapDispatchToProps = {
  getOneCI,
  modifyOneCI,
  showNotification,
  clearNotifications,
  changeCourseField,
  resetLoading,
  addRedirectHook,
  setFinalReview,
  forceRedirect
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
  showNotification: PropTypes.func.isRequired,
  clearNotifications: PropTypes.func.isRequired,
  changeCourseField: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,
  setFinalReview: PropTypes.func.isRequired,
  forceRedirect: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModifyCourseInstancePage)
