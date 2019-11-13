import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Icon, Dropdown, Grid, Popup } from 'semantic-ui-react'
import { usePersistedState } from '../../../hooks/persistedState'

export const CoursePageTeacherBulkForm = props => {
  const {
    coursePageLogic,
    courseId,
    dropDownTags,
    dropDownTeachers,
    changeSelectedTag,
    changeSelectedTeacher,
    bulkAddTag,
    bulkRemoveTag,
    bulkUpdateTeacher,
    bulkMarkDropped,
    bulkMarkNotDropped,
    bulkMarkValid,
    bulkMarkInvalid
  } = props
  const state = usePersistedState(`CoursePage-${courseId}`, { showMassAssignForm: false })
  const numSelected = Object.keys(coursePageLogic.selectedStudents).length
  const disabled = numSelected < 1

  return (
    <span className="TeacherBulkForm" style={{ position: 'fixed', bottom: 0, background: 'rgba(255,255,255,0.9)', textAlign: 'center', left: 0, right: 0 }}>
      <Accordion>
        <Accordion.Title style={{ background: '#f0f0f0' }} active={state.showMassAssignForm} index={0} onClick={() => (state.showMassAssignForm = !state.showMassAssignForm)}>
          <Icon size="big" name={state.showMassAssignForm ? 'caret down' : 'caret up'} />
          <h4 style={{ display: 'inline' }}>Modify selected students</h4> ({numSelected > 0 ? <b>{numSelected} selected</b> : <span>{numSelected} selected</span>})
        </Accordion.Title>
        <Accordion.Content active={state.showMassAssignForm}>
          <br />
          <Grid columns={2} divided style={{ width: '90%', display: 'inline-block' }}>
            <Grid.Row>
              <Grid.Column>
                <Dropdown id="tagDropdown" style={{ float: 'left' }} options={dropDownTags} onChange={changeSelectedTag} placeholder="Choose tag" fluid selection />
              </Grid.Column>
              <Grid.Column>
                <div className="two ui buttons" style={{ float: 'left' }}>
                  <button
                    className="ui icon positive button"
                    disabled={disabled}
                    onClick={() => {
                      bulkAddTag()
                      state.showMassAssignForm = false
                    }}
                    size="mini"
                  >
                    <i className="plus icon" />
                  </button>
                  <div className="or" />
                  <button
                    className="ui icon button"
                    disabled={disabled}
                    onClick={() => {
                      bulkRemoveTag()
                      state.showMassAssignForm = false
                    }}
                    size="mini"
                  >
                    <i className="trash icon" />
                  </button>
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Dropdown id="assistantDropdown" options={dropDownTeachers} onChange={changeSelectedTeacher} placeholder="Select teacher" fluid selection />
              </Grid.Column>
              <Grid.Column>
                <Button
                  disabled={disabled}
                  onClick={() => {
                    bulkUpdateTeacher()
                    state.showMassAssignForm = false
                  }}
                  size="small"
                >
                  Change instructor
                </Button>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button
                  disabled={disabled}
                  onClick={() => {
                    bulkMarkNotDropped()
                    state.showMassAssignForm = false
                  }}
                >
                  Mark as non-dropped
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Button
                  disabled={disabled}
                  color="red"
                  onClick={() => {
                    bulkMarkDropped()
                    state.showMassAssignForm = false
                  }}
                >
                  Mark as dropped
                </Button>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Button disabled={disabled} onClick={() => {
                  bulkMarkValid()
                  state.showMassAssignForm = false
                }}>
                  Valid course registration
                </Button>
              </Grid.Column>
              <Grid.Column>
                <Popup
                  content="Mark a registration as invalid, if the student accidentally registered onto the course"
                  trigger={
                    <Button disabled={disabled} basic color="red" onClick={() => {
                      bulkMarkInvalid()
                      state.showMassAssignForm = false
                    }}>
                      Invalid course registration
                    </Button>
                  }
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
          <br />
        </Accordion.Content>
      </Accordion>
      <br />
    </span>
  )
}

CoursePageTeacherBulkForm.propTypes = {
  coursePageLogic: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,
  dropDownTags: PropTypes.array.isRequired,
  dropDownTeachers: PropTypes.array.isRequired,

  changeSelectedTag: PropTypes.func.isRequired,
  changeSelectedTeacher: PropTypes.func.isRequired,
  bulkAddTag: PropTypes.func.isRequired,
  bulkRemoveTag: PropTypes.func.isRequired,
  bulkUpdateTeacher: PropTypes.func.isRequired,
  bulkMarkDropped: PropTypes.func.isRequired,
  bulkMarkNotDropped: PropTypes.func.isRequired,
  bulkMarkValid: PropTypes.func.isRequired,
  bulkMarkInvalid: PropTypes.func.isRequired
}

export default CoursePageTeacherBulkForm
