import React from 'react'
import PropTypes from 'prop-types'
import { Table, Checkbox, Popup, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'
import HorizontalScrollable from './HorizontalScrollable'
import { getAllTags, tagStudent, unTagStudent } from '../services/tags'
import { associateTeacherToStudent } from '../services/assistant'
import { showAssistantDropdown, showTagDropdown, selectStudent, unselectStudent, selectAllStudents, unselectAllStudents, invertStudentSelection } from '../reducers/coursePageLogicReducer'
import { createDropdownTeachers, createDropdownTags } from '../util/dropdown'
import { usePersistedState } from '../hooks/persistedState'
import { updateStudentProjectInfo } from '../services/studentinstances'

import { StudentTableRow } from './StudentTable/StudentTableRow'
import PointHeaders from './StudentTable/PointHeaders'
import InstructorFilter from './StudentTable/InstructorFilter'
import TagFilter from './StudentTable/TagFilter'

export const StudentTable = props => {
  const state = usePersistedState(props.persistentFilterKey || null, {
    filterByAssistant: 0,
    filterByTag: []
  })

  const handleSelectAll = (e, data) => {
    if (!data) {
      return
    }

    const { checked } = data
    // we use filteredData so that we only select or deselect
    // only the filtered entries. sneaky!
    const ids = filteredData.map(data => data.id)
    if (checked) {
      props.selectAllStudents(ids)
    } else {
      props.unselectAllStudents(ids)
    }
  }

  const changeFilterAssistant = (_, data) => {
    const { value } = data
    filterByAssistant(value)
  }

  const handleSelectInvert = () => {
    props.invertStudentSelection(filteredData.map(data => data.id))
  }

  const addFilterTag = tag => {
    return () => {
      filterByTag(tag)
    }
  }

  const filterByAssistant = assistant => {
    state.filterByAssistant = assistant
  }

  const filterByTag = tag => {
    if (tag === 0) {
      state.filterByTag = []
    } else if (state.filterByTag.map(tag => tag.id).includes(tag.id)) {
      state.filterByTag = state.filterByTag.filter(t => t.id !== tag.id)
    } else {
      state.filterByTag = [...state.filterByTag, tag]
    }
  }

  const hasFilteringTags = (studentTagsData, filteringTags) => {
    let studentInstanceTagIds = studentTagsData.map(tag => tag.id)
    let filteringTagIds = filteringTags.map(tag => tag.id)
    let hasRequiredTags = true
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (!studentInstanceTagIds.includes(filteringTagIds[i])) {
        hasRequiredTags = false
      }
    }
    return hasRequiredTags
  }

  const countStudentsWithTag = (studentInstances, tagId) => {
    let count = 0
    studentInstances.forEach(studentInstance => {
      if (studentInstance.Tags.find(tag => tag.id === tagId)) {
        ++count
      }
    })
    return count
  }

  const formatGrade = grade => (grade !== undefined ? grade : null)
  const getStudentFinalGrade = student => formatGrade((student.weeks.find(week => week.weekNumber === props.selectedInstance.weekAmount + 1) || {}).grade)
  const shouldHideGrade = !props.selectedInstance.finalReview || !props.studentInstances.some(studentInstance => !!(getStudentFinalGrade(studentInstance) === null))

  const shouldHideInstructor = studentInstances => studentInstances.every(studentInstance => studentInstance.teacherInstanceId === null)

  const { columns, disableDefaultFilter, filterStudents, studentColumnName, showFooter, extraStudentIcon, studentFooter } = props

  const showColumn = column => columns.indexOf(column) >= 0
  const nullFunc = () => nullFunc
  const extraColumns = columns.filter(column => Array.isArray(column) && column.length === 3).map(([header, cell, footer]) => [header || nullFunc, cell || nullFunc, footer || nullFunc])

  let dropDownTeachers = []
  dropDownTeachers = createDropdownTeachers(props.selectedInstance.teacherInstances, dropDownTeachers)
  let dropDownFilterTeachers = [
    {
      key: 0,
      text: 'no filter',
      value: 0
    }
  ]
  dropDownFilterTeachers = createDropdownTeachers(props.selectedInstance.teacherInstances, dropDownFilterTeachers)

  const courseTags = (props.tags.tags || []).filter(tag => tag.courseInstanceId === null || tag.courseInstanceId === props.selectedInstance.id)
  let dropDownTags = []
  dropDownTags = createDropdownTags(courseTags, dropDownTags)
  let dropDownFilterTags = createDropdownTags(courseTags, []).filter(
    tag => state.filterByTag.find(t => t.id === tag.value) || (props.studentInstances && countStudentsWithTag(props.studentInstances, tag.value) > 0)
  )
  dropDownFilterTags = dropDownFilterTags.map(tag => courseTags.find(t => t.id === tag.value))

  // remove duplicate tags
  const courseTagNames = courseTags.filter(tag => tag.courseInstanceId === props.selectedInstance.id).map(tag => tag.name)
  // filter out tags if:
  //     1. they are global, and
  //     2. there is a course tag of the same name
  dropDownTags = dropDownTags.filter(tag => !courseTagNames.includes(tag.text) || props.tags.tags.find(t => t.id === tag.value).courseInstanceId === props.selectedInstance.id)

  const dataFilter = data =>
    disableDefaultFilter ||
    // remove students when filtering assistants and it doesn't match
    ((state.filterByAssistant === 0 || state.filterByAssistant === data.teacherInstanceId || (state.filterByAssistant === '-' && data.teacherInstanceId === null)) && // unassign = -
      // remove students when filtering tags and they don't match
      (state.filterByTag.length === 0 || hasFilteringTags(data.Tags, state.filterByTag)))

  const filteredData = (props.studentInstances || []).filter(dataFilter).filter(filterStudents ? filterStudents : () => true)

  //Set of tags that are used by at least one student
  const usedTags = filteredData
    .map(student => student.Tags)
    .reduce((set, tags) => {
      tags.forEach(tag => set.add(tag.id))
      return set
    }, new Set())

  if (props.onFilter) {
    props.onFilter(filteredData.map(data => data.id))
  }

  // all students currently visible selected?
  const allSelected = filteredData.length && filteredData.map(data => data.id).every(id => props.coursePageLogic.selectedStudents[id])

  return (
    <>
      <div style={{ textAlign: 'left' }}>
        {(props.extraButtons || []).map(f => f())}
        {showColumn('instructor') && <InstructorFilter dropDownFilterTeachers={dropDownFilterTeachers} changeFilterAssistant={changeFilterAssistant} defaultValue={state.filterByAssistant} />}
        <TagFilter dropDownFilterTags={dropDownFilterTags} selectedFilterTags={state.filterByTag} addFilterTag={addFilterTag} usedTags={usedTags} />
      </div>
      <br />

      <HorizontalScrollable>
        <Table celled compact unstackable singleLine style={{ overflowX: 'visible' }}>
          <Table.Header>
            <Table.Row>
              {showColumn('select') && (
                <Table.HeaderCell key={-2}>
                  <Popup
                    trigger={
                      <div>
                        <Icon style={{ marginBottom: '1.75em', marginLeft: '0.2em' }} link name="exchange" id={'selectInvert'} size="small" onClick={handleSelectInvert} />
                      </div>
                    }
                    content="Invert selection"
                  />
                  <Checkbox id={'selectAll'} disabled={filteredData.length < 1} checked={allSelected} onChange={handleSelectAll} />
                </Table.HeaderCell>
              )}
              <Table.HeaderCell key={-1}>{studentColumnName || 'Student'}</Table.HeaderCell>
              <Table.HeaderCell>Project Info</Table.HeaderCell>
              {showColumn('points') && (
                <>
                  <PointHeaders />
                  <Table.HeaderCell>Sum</Table.HeaderCell>
                </>
              )}
              {showColumn('grade') && !shouldHideGrade && (
                <>
                  <Table.HeaderCell>Grade</Table.HeaderCell>
                </>
              )}
              {showColumn('instructor') && !shouldHideInstructor(props.studentInstances) && (
                <Table.HeaderCell width={shouldHideInstructor(props.studentInstances) ? null : 'six'}>Instructor</Table.HeaderCell>
              )}
              {extraColumns.map(([header, ,]) => header())}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredData.map(data => (
              <StudentTableRow
                key={`tableRow${data.id}`}
                showColumn={showColumn}
                data={data}
                extraColumns={extraColumns}
                dropDownTags={dropDownTags}
                dropDownTeachers={dropDownTeachers}
                addFilterTag={addFilterTag}
                shouldHideInstructor={shouldHideInstructor}
                shouldHideGrade={shouldHideGrade}
                getStudentFinalGrade={getStudentFinalGrade}
                extraStudentIcon={extraStudentIcon}
                allowReview={props.allowReview}
                allowModify={props.allowModify}
                showCommentNotification={props.showCommentNotification}
                loggedInUser={props.loggedInUser}
                coursePageLogic={props.coursePageLogic}
                selectedInstance={props.selectedInstance}
                courseData={props.courseData}
                studentInstances={props.studentInstances}
                associateTeacherToStudent={props.associateTeacherToStudent}
                selectStudent={props.selectStudent}
                unselectStudent={props.unselectStudent}
                showAssistantDropdown={props.showAssistantDropdown}
                showTagDropdown={props.showTagDropdown}
                tagStudent={props.tagStudent}
                unTagStudent={props.unTagStudent}
                getAllTags={props.getAllTags}
                updateStudentProjectInfo={props.updateStudentProjectInfo}
              />
            ))}
          </Table.Body>
          {/* <Table.Body>{filteredData.map(data => createStudentTableRow(showColumn, data, extraColumns, dropDownTags, dropDownTeachers, props))}</Table.Body> --> */}
          {showFooter && (
            <Table.Footer>
              <Table.Row>
                {showColumn('select') && (
                  <Table.HeaderCell key={-2}>
                    <Checkbox id={'selectAllBottom'} disabled={!filteredData.length} checked={allSelected} onChange={handleSelectAll} />
                  </Table.HeaderCell>
                )}
                {studentFooter ? studentFooter() : <Table.HeaderCell />}
                <Table.HeaderCell />
                {showColumn('points') && <Table.HeaderCell />}
                {showColumn('grade') && !shouldHideGrade && <Table.HeaderCell />}
                {showColumn('instructor') && !shouldHideInstructor(props.studentInstances) && <Table.HeaderCell />}
                {showColumn('review') && <Table.HeaderCell />}
                {extraColumns.map(([, , footer]) => footer())}
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </HorizontalScrollable>
    </>
  )
}

const mapDispatchToProps = {
  associateTeacherToStudent,
  showAssistantDropdown,
  showTagDropdown,
  getAllTags,
  tagStudent,
  unTagStudent,
  selectStudent,
  unselectStudent,
  selectAllStudents,
  unselectAllStudents,
  invertStudentSelection,
  updateStudentProjectInfo
}

StudentTable.propTypes = {
  columns: PropTypes.array,
  allowModify: PropTypes.bool,
  allowReview: PropTypes.bool,
  showCommentNotification: PropTypes.bool,
  disableDefaultFilter: PropTypes.bool,
  showFooter: PropTypes.bool,
  studentColumnName: PropTypes.string,
  extraButtons: PropTypes.array,
  onFilter: PropTypes.func,
  persistentFilterKey: PropTypes.string,
  extraStudentIcon: PropTypes.func,
  studentFooter: PropTypes.func,
  filterStudents: PropTypes.func,

  studentInstances: PropTypes.array.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,
  courseData: PropTypes.object,
  loggedInUser: PropTypes.object,

  associateTeacherToStudent: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  selectStudent: PropTypes.func.isRequired,
  unselectStudent: PropTypes.func.isRequired,
  selectAllStudents: PropTypes.func.isRequired,
  unselectAllStudents: PropTypes.func.isRequired,
  invertStudentSelection: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(StudentTable)
