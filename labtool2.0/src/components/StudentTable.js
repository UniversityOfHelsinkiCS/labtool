import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Table, Popup, Dropdown, Label, Checkbox } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import HorizontalScrollable from './HorizontalScrollable'
import { getAllTags, tagStudent, unTagStudent } from '../services/tags'
import { associateTeacherToStudent } from '../services/assistant'
import { showAssistantDropdown, showTagDropdown, selectTeacher, selectTag, selectStudent, unselectStudent, selectAllStudents, unselectAllStudents } from '../reducers/coursePageLogicReducer'
import { createDropdownTeachers, createDropdownTags } from '../util/dropdown'
import useLegacyState from '../hooks/legacyState'
import { createRepositoryLink } from '../util/format'

const { Fragment } = React

export const StudentTable = props => {
  const state = useLegacyState({
    filterByAssistant: 0,
    filterByTag: []
  })

  const updateTeacher = id => async e => {
    try {
      e.preventDefault()
      let teacherId = props.coursePageLogic.selectedTeacher
      if (teacherId === '-') {
        // unassign
        teacherId = null
      }

      const data = {
        studentInstanceId: id,
        teacherInstanceId: teacherId
      }
      await props.associateTeacherToStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectCheck = id => (e, data) => {
    const { checked } = data
    if (checked) {
      props.selectStudent(id)
    } else {
      props.unselectStudent(id)
    }
  }

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

  const changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      props.selectTeacher(value)
    }
  }

  const changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      props.selectTag(value)
    }
  }

  const changeHiddenAssistantDropdown = id => {
    return () => {
      props.showAssistantDropdown(props.coursePageLogic.showAssistantDropdown === id ? '' : id)
    }
  }

  const changeHiddenTagDropdown = id => {
    return () => {
      props.showTagDropdown(props.coursePageLogic.showTagDropdown === id ? '' : id)
    }
  }

  const addTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: props.coursePageLogic.selectedTag
      }
      await props.tagStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const removeTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: props.coursePageLogic.selectedTag
      }
      await props.unTagStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const changeFilterAssistant = () => {
    return (e, data) => {
      const { value } = data
      filterByAssistant(value)
    }
  }

  const changeFilterTag = (e, data) => {
    const { value } = data
    const tag = props.tags.tags.find(tag => tag.id === value)
    if (tag) {
      filterByTag(tag)
    }
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

  const shouldHideInstructor = studentInstances => studentInstances.every(studentInstance => studentInstance.teacherInstanceId === null)

  const createHeadersTeacher = () => {
    const headers = []
    let i = 0
    for (; i < props.selectedInstance.weekAmount; i++) {
      headers.push(<Table.HeaderCell key={i}>Wk {i + 1}</Table.HeaderCell>)
    }
    for (var ii = 1; ii <= props.selectedInstance.amountOfCodeReviews; ii++) {
      headers.push(
        <Table.HeaderCell key={i + ii}>
          Code
          <br />
          Review
          <br />
          {ii}{' '}
        </Table.HeaderCell>
      )
    }
    if (props.selectedInstance.finalReview) {
      headers.push(
        <Table.HeaderCell key={i + ii + 1}>
          Final
          <br />
          Review{' '}
        </Table.HeaderCell>
      )
    }
    return headers
  }

  const createIndents = (weeks, codeReviews, siId) => {
    const cr =
      codeReviews &&
      codeReviews.reduce((a, b) => {
        return { ...a, [b.reviewNumber]: b.points }
      }, {})
    const indents = []
    let i = 0
    let weekPoints = {}
    let finalPoints = undefined

    const tableCellLinkStyle = { position: 'absolute', display: 'inline-block', top: 0, left: 0, right: 0, bottom: 0 }
    const flexCenter = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }

    for (var j = 0; j < weeks.length; j++) {
      if (weeks[j].weekNumber === props.selectedInstance.weekAmount + 1) {
        finalPoints = weeks[j].points
      } else if (weeks[j].weekNumber) {
        weekPoints[weeks[j].weekNumber] = weeks[j].points
      }
    }
    for (; i < props.selectedInstance.weekAmount; i++) {
      // we have <br /> to make this easier to click, but it'd be better
      // if we could Link an entire Table.Cell, this however breaks formatting
      // completely.

      indents.push(
        <Table.Cell selectable key={'week' + i} textAlign="center" style={{ position: 'relative' }}>
          <Link
            style={tableCellLinkStyle}
            key={'week' + i + 'link'}
            to={
              weekPoints[i + 1] === undefined
                ? `/labtool/reviewstudent/${props.selectedInstance.ohid}/${siId}/${i + 1}`
                : { pathname: `/labtool/browsereviews/${props.selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i } }
            }
          >
            <p style={flexCenter}>{weekPoints[i + 1] !== undefined ? weekPoints[i + 1] : '-'}</p>
          </Link>
        </Table.Cell>
      )
    }

    let ii = 0
    const { amountOfCodeReviews } = props.selectedInstance
    if (amountOfCodeReviews) {
      for (let index = 1; index <= amountOfCodeReviews; index++) {
        indents.push(
          <Table.Cell selectable key={siId + index} textAlign="center" style={{ position: 'relative' }}>
            <Link
              className="codeReviewPoints"
              style={tableCellLinkStyle}
              key={'codeReview' + i + ii + 'link'}
              to={{ pathname: `/labtool/browsereviews/${props.selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i + ii } }}
            >
              <p style={flexCenter}>{cr[index] || cr[index] === 0 ? cr[index] : '-'}</p>
            </Link>
          </Table.Cell>
        )
        ++ii
      }
    }

    if (props.selectedInstance.finalReview) {
      let finalReviewPointsCell = (
        <Table.Cell selectable key={i + ii + 1} textAlign="center" style={{ position: 'relative' }}>
          <Link
            style={tableCellLinkStyle}
            key={'finalReviewlink'}
            to={
              finalPoints === undefined
                ? `/labtool/reviewstudent/${props.selectedInstance.ohid}/${siId}/${i + 1}`
                : { pathname: `/labtool/browsereviews/${props.selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i + ii } }
            }
          >
            <div style={{ width: '100%', height: '100%' }}>
              <p style={flexCenter}>{finalPoints === undefined ? '-' : finalPoints}</p>
            </div>
          </Link>
        </Table.Cell>
      )
      indents.push(finalReviewPointsCell)
    }

    return indents
  }

  const createStudentTableRow = (showColumn, data, extraColumns, dropDownTags, dropDownTeachers, { rowClassName, allowReview }) => (
    <Table.Row key={data.id} className={rowClassName}>
      {/* Select Check Box */}
      {showColumn('select') && (
        <Table.Cell key="select">
          <Checkbox id={'select' + data.id + '-' + rowClassName} checked={props.coursePageLogic.selectedStudents[data.id] || false} onChange={handleSelectCheck(data.id)} />
        </Table.Cell>
      )}

      {/* Student */}
      <Table.Cell key="studentinfo">
        {allowReview ? (
          <Link to={`/labtool/browsereviews/${props.selectedInstance.ohid}/${data.id}`}>
            <Popup
              trigger={
                <span>
                  {data.User.firsts} {data.User.lastname}
                  <br />({data.User.studentNumber})
                </span>
              }
              content="Review student"
            />
          </Link>
        ) : (
          <span>
            {data.User.firsts} {data.User.lastname}
            <br />({data.User.studentNumber})
          </span>
        )}
      </Table.Cell>

      {/* Project Info */}
      <Table.Cell key="projectinfo">
        <span>
          {data.projectName}
          <br />
          {createRepositoryLink(data.github)}
          {data.Tags.map(tag => (
            <div key={data.id + ':' + tag.id}>
              <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                {tag.name}
              </Button>
            </div>
          ))}
          {props.allowModify && (
            <Popup
              trigger={<Icon id={'tagModify-' + rowClassName} onClick={changeHiddenTagDropdown(data.id)} name="pencil" color="green" style={{ float: 'right', fontSize: '1.25em' }} />}
              content="Add or remove tag"
            />
          )}
        </span>
        {props.allowModify && (
          <div>
            {props.coursePageLogic.showTagDropdown === data.id ? (
              <div>
                <Dropdown id={'tagDropdown-' + rowClassName} style={{ float: 'left' }} options={dropDownTags} onChange={changeSelectedTag()} placeholder="Choose tag" fluid selection />
                <br />
                <div className="two ui buttons" style={{ float: 'left' }}>
                  <button className="ui icon positive button" onClick={addTag(data.id)} size="mini">
                    <i className="plus icon" />
                  </button>
                  <div className="or" />
                  <button className="ui icon button" onClick={removeTag(data.id)} size="mini">
                    <i className="trash icon" />
                  </button>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </Table.Cell>

      {showColumn('points') && (
        <Fragment>
          {/* Week #, Code Review # */}
          {createIndents(data.weeks, data.codeReviews, data.id)}

          {/* Sum */}
          <Table.Cell key="pointssum" textAlign="center">
            {(data.weeks.map(week => week.points).reduce((a, b) => a + b, 0) + data.codeReviews.map(cr => cr.points).reduce((a, b) => a + b, 0)).toFixed(2).replace(/[.,]00$/, '')}
          </Table.Cell>
        </Fragment>
      )}

      {/* Instructor */}
      {showColumn('instructor') && (!shouldHideInstructor(props.studentInstances) || props.allowModify) && (
        <Table.Cell key="instructor">
          {!shouldHideInstructor(props.studentInstances) &&
            (data.teacherInstanceId && props.selectedInstance.teacherInstances ? (
              props.selectedInstance.teacherInstances
                .filter(teacher => teacher.id === data.teacherInstanceId)
                .map(teacher => (
                  <span key={data.id + ':' + teacher.id}>
                    {teacher.firsts} {teacher.lastname}
                  </span>
                ))
            ) : (
              <span>not assigned</span>
            ))}
          {props.allowModify && (
            <Fragment>
              <Popup
                trigger={<Button circular onClick={changeHiddenAssistantDropdown(data.id)} size="small" icon={{ name: 'pencil' }} style={{ margin: '0.25em', float: 'right' }} />}
                content="Assign instructor"
              />
              {props.coursePageLogic.showAssistantDropdown === data.id ? (
                <div>
                  <Dropdown id={'assistantDropdown-' + rowClassName} options={dropDownTeachers} onChange={changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
                  <Button onClick={updateTeacher(data.id, data.teacherInstanceId)} size="small">
                    Change instructor
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </Fragment>
          )}
        </Table.Cell>
      )}

      {(extraColumns || []).map(([, cell]) => cell(data))}
    </Table.Row>
  )

  const { columns, rowClassName, disableDefaultFilter, studentColumnName, showFooter } = props

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

  let dropDownTags = []
  dropDownTags = createDropdownTags(props.tags.tags, dropDownTags)
  let dropDownFilterTags = [
    {
      key: '-',
      text: 'Select a tag',
      value: ''
    }
  ]
  dropDownFilterTags = createDropdownTags(props.tags.tags, dropDownFilterTags)

  const dataFilter = data =>
    disableDefaultFilter ||
    // remove students when filtering assistants and it doesn't match
    ((state.filterByAssistant === 0 || state.filterByAssistant === data.teacherInstanceId || (state.filterByAssistant === '-' && data.teacherInstanceId === null)) && // unassign = -
      // remove students when filtering tags and they don't match
      (state.filterByTag.length === 0 || hasFilteringTags(data.Tags, state.filterByTag)))

  const filteredData = (props.studentInstances || []).filter(dataFilter)

  if (props.onFilter) {
    props.onFilter(filteredData.map(data => data.id))
  }

  // all students currently visible selected?
  const allSelected = filteredData.length && filteredData.map(data => data.id).every(id => props.coursePageLogic.selectedStudents[id])

  // calculate the length of the longest text in a drop down
  const getBiggestWidthInDropdown = dropdownList => {
    if (dropdownList.length === 0) {
      return 3
    }
    const lengths = dropdownList.map(dp => dp.text.length)
    return lengths.reduce((longest, comp) => (longest > comp ? longest : comp), lengths[0])
  }

  return (
    <Fragment>
      <div style={{ textAlign: 'left' }}>
        {(props.extraButtons || []).map(f => f())}
        {showColumn('instructor') && (
          <span>
            <span>Filter by instructor: </span>
            <Dropdown
              scrolling
              options={dropDownFilterTeachers}
              onChange={changeFilterAssistant()}
              placeholder="Select Teacher"
              defaultValue={state.filterByAssistant}
              selection
              style={{ width: `${getBiggestWidthInDropdown(dropDownFilterTeachers)}em` }}
            />
          </span>
        )}
        <span> Add filtering tag: </span>
        <Dropdown scrolling options={dropDownFilterTags} onChange={changeFilterTag} placeholder="Select a tag" value="" selection style={{ width: `${getBiggestWidthInDropdown(dropDownTags)}em` }} />
        <span> Tag filters: </span>
        {state.filterByTag.length === 0 ? (
          <span>
            <Label>none</Label>
          </span>
        ) : (
          <span>
            {state.filterByTag.map(tag => (
              <span key={tag.id}>
                <Button compact className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                  {tag.name}
                </Button>
              </span>
            ))}
          </span>
        )}
      </div>

      <HorizontalScrollable>
        <Table celled compact unstackable singleLine style={{ overflowX: 'visible' }}>
          <Table.Header>
            <Table.Row>
              {showColumn('select') && (
                <Table.HeaderCell key={-2}>
                  <Checkbox id={'selectAll-' + rowClassName} disabled={filteredData.length < 1} checked={allSelected} onChange={handleSelectAll} />
                </Table.HeaderCell>
              )}
              <Table.HeaderCell key={-1}>{studentColumnName || 'Student'}</Table.HeaderCell>
              <Table.HeaderCell>Project Info</Table.HeaderCell>
              {showColumn('points') && (
                <Fragment>
                  {createHeadersTeacher() /* Week #, Code Review # */}
                  <Table.HeaderCell>Sum</Table.HeaderCell>
                </Fragment>
              )}
              {showColumn('instructor') && (!shouldHideInstructor(props.studentInstances) || props.allowModify) && (
                <Table.HeaderCell width={shouldHideInstructor(props.studentInstances) ? null : 'six'}>Instructor</Table.HeaderCell>
              )}
              {extraColumns.map(([header, ,]) => header())}
            </Table.Row>
          </Table.Header>
          <Table.Body>{filteredData.map(data => createStudentTableRow(showColumn, data, extraColumns, dropDownTags, dropDownTeachers, props))}</Table.Body>
          {showFooter && (
            <Table.Footer>
              <Table.Row>
                {showColumn('select') && (
                  <Table.HeaderCell key={-2}>
                    <Checkbox id={'selectAllBottom-' + rowClassName} disabled={!filteredData.length} checked={allSelected} onChange={handleSelectAll} />
                  </Table.HeaderCell>
                )}
                <Table.HeaderCell />
                <Table.HeaderCell />
                {showColumn('points') && <Table.HeaderCell />}
                {showColumn('instructor') && !shouldHideInstructor(props.studentInstances) && <Table.HeaderCell />}
                {showColumn('review') && <Table.HeaderCell />}
                {extraColumns.map(([, , footer]) => footer())}
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </HorizontalScrollable>
    </Fragment>
  )
}

const mapDispatchToProps = {
  associateTeacherToStudent,
  showAssistantDropdown,
  showTagDropdown,
  selectTeacher,
  selectTag,
  getAllTags,
  tagStudent,
  unTagStudent,
  selectStudent,
  unselectStudent,
  selectAllStudents,
  unselectAllStudents
}

StudentTable.propTypes = {
  rowClassName: PropTypes.string,
  columns: PropTypes.array,
  allowModify: PropTypes.bool,
  allowReview: PropTypes.bool,
  disableDefaultFilter: PropTypes.bool,
  showFooter: PropTypes.bool,
  studentColumnName: PropTypes.string,
  extraButtons: PropTypes.array,
  onFilter: PropTypes.func,

  studentInstances: PropTypes.array.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,

  associateTeacherToStudent: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  selectStudent: PropTypes.func.isRequired,
  unselectStudent: PropTypes.func.isRequired,
  selectAllStudents: PropTypes.func.isRequired,
  unselectAllStudents: PropTypes.func.isRequired
}

export default connect(
  null,
  mapDispatchToProps
)(StudentTable)
