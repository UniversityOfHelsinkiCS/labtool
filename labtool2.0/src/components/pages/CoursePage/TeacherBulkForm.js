import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Icon, Dropdown, Grid, Popup } from 'semantic-ui-react'
import { usePersistedState } from '../../../hooks/persistedState'
import { Link } from 'react-router-dom'

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
    bulkMarkInvalid,
    exportCSV,
    selectedInstance
  } = props
  const state = usePersistedState(`CoursePage-${courseId}`, { showMassAssignForm: false })
  const numSelected = Object.keys(coursePageLogic.selectedStudents).length
  const disabled = numSelected < 1

  return (
    <span className="TeacherBulkForm" style={{ position: 'fixed', bottom: 0, background: 'rgba(255,255,255,0.9)', textAlign: 'center', left: 0, right: 0 }}>
      <Accordion>
        <Accordion.Title style={{ background: '#f0f0f0' }} active={state.showMassAssignForm} index={0} onClick={() => (state.showMassAssignForm = !state.showMassAssignForm)}>
          <Icon size="big" name={state.showMassAssignForm ? 'caret down' : 'caret up'} />
          <h4 style={{ display: 'inline' }}>Student tools</h4> (
          {numSelected > 0 ? (
            <b>
              {numSelected} student{numSelected === 1 ? '' : 's'} selected
            </b>
          ) : (
            <span>{numSelected} students selected</span>
          )}
          )
        </Accordion.Title>
        <Accordion.Content active={state.showMassAssignForm}>
          <br />
          <h3 style={{ display: 'inline' }}> Modify selected students</h3>
          <br />
          <br />
          <Grid columns={2} divided style={{ width: '90%', display: 'inline-block' }}>
            <Grid.Row>
              <Grid.Column>
                <Dropdown id="tagDropdown" style={{ float: 'left', display: 'inline', width: '48%' }} options={dropDownTags} onChange={changeSelectedTag} placeholder="Choose tag" fluid selection />
                <div className="two ui buttons" style={{ float: 'right', display: 'inline', width: '48%' }}>
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
                  <div className="or" style={{ display: 'inline' }} />
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
              <Grid.Column>
                <Dropdown
                  id="assistantDropdown"
                  options={dropDownTeachers}
                  onChange={changeSelectedTeacher}
                  placeholder="Select teacher"
                  fluid
                  selection
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                />
                <Button
                  style={{ float: 'right', display: 'inline', width: '48%' }}
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
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  onClick={() => {
                    bulkMarkNotDropped()
                    state.showMassAssignForm = false
                  }}
                >
                  Mark as non-dropped
                </Button>
                <Button
                  style={{ float: 'right', display: 'inline', width: '48%' }}
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
              <Grid.Column>
                <Button
                  style={{ float: 'left', display: 'inline', width: '48%' }}
                  disabled={disabled}
                  onClick={() => {
                    bulkMarkValid()
                    state.showMassAssignForm = false
                  }}
                >
                  Intended course registration
                </Button>
                <Popup
                  content="Mark a registration as mistaken, if the student accidentally registered onto the course"
                  trigger={
                    <Button
                      style={{ float: 'right', display: 'inline-block', width: '48%' }}
                      disabled={disabled}
                      basic
                      color="red"
                      onClick={() => {
                        bulkMarkInvalid()
                        state.showMassAssignForm = false
                      }}
                    >
                      Mistaken course registration
                    </Button>
                  }
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
          <h3>Tools</h3>
          <Grid columns={2} divided style={{ width: '90%', display: 'inline-block' }}>
            <Grid.Row>
              <Grid.Column>
                <Link to={`/labtool/massemail/${selectedInstance.ohid}`}>
                  <Button size="small">Send email to multiple students</Button>
                </Link>
              </Grid.Column>
              <Grid.Column>
                <Button size="small" onClick={exportCSV}>
                  Export CSV of all students
                </Button>
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
  bulkMarkInvalid: PropTypes.func.isRequired,
  exportCSV: PropTypes.func.isRequired
}

export default CoursePageTeacherBulkForm
