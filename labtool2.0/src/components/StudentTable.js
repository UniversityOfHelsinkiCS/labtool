import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Table, Form, Popup, Dropdown, Label } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import HorizontalScrollable from './HorizontalScrollable'
import { getAllTags, tagStudent, unTagStudent } from '../services/tags'
import { associateTeacherToStudent } from '../services/assistant'
import { showAssistantDropdown, showTagDropdown, filterByTag, filterByAssistant, selectTeacher, selectTag } from '../reducers/coursePageLogicReducer'

const { Fragment } = React

export const StudentTable = props => {
  const createDropdownTeachers = array => {
    if (props.selectedInstance.teacherInstances !== undefined) {
      array.push({
        key: '-',
        text: '(unassigned)',
        value: '-'
      })
      props.selectedInstance.teacherInstances.map(m =>
        array.push({
          key: m.id,
          text: m.firsts + ' ' + m.lastname,
          value: m.id
        })
      )
      return array
    }
    return []
  }

  const createDropdownTags = array => {
    if (props.tags.tags !== undefined) {
      props.tags.tags.map(tag =>
        array.push({
          key: tag.id,
          text: tag.name,
          value: tag.id
        })
      )
      return array
    }
    return []
  }

  const updateTeacher = id => async e => {
    try {
      e.preventDefault()
      let teacherId = props.coursePageLogic.selectedTeacher
      if (teacherId == '-') {
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
      props.filterByAssistant(value)
    }
  }

  const addFilterTag = tag => {
    return () => {
      props.filterByTag(tag)
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

  const createHeadersTeacher = () => {
    const headers = []
    let i = 0
    for (; i < props.selectedInstance.weekAmount; i++) {
      headers.push(
        <Table.HeaderCell key={i}>
          Week
          <br />
          {i + 1}{' '}
        </Table.HeaderCell>
      )
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
    let finalPoints = undefined
    for (; i < props.selectedInstance.weekAmount; i++) {
      let pushattava = (
        <Table.Cell key={i}>
          <p>-</p>
        </Table.Cell>
      )

      for (var j = 0; j < weeks.length; j++) {
        if (i + 1 === weeks[j].weekNumber) {
          pushattava = (
            <Table.Cell key={i}>
              <p>{weeks[j].points}</p>
            </Table.Cell>
          )
        } else if (weeks[j].weekNumber === props.selectedInstance.weekAmount + 1) {
          finalPoints = weeks[j].points
        }
      }
      indents.push(pushattava)
    }

    let ii = 0
    const { amountOfCodeReviews } = props.selectedInstance
    if (amountOfCodeReviews) {
      for (let index = 1; index <= amountOfCodeReviews; index++) {
        indents.push(<Table.Cell key={siId + index}>{cr[index] || cr[index] === 0 ? <p className="codeReviewPoints">{cr[index]}</p> : <p>-</p>}</Table.Cell>)
      }
    }
    // codeReviews.forEach(cr => {
    //   indents.push(<Table.Cell key={i + ii}>{cr.points !== null ? <p className="codeReviewPoints">{cr.points}</p> : <p>-</p>}</Table.Cell>)
    //   ii++
    // // })
    // while (ii < numberOfCodeReviews) {
    //   indents.push(
    //     <Table.Cell key={i + ii}>
    //       <p>-</p>
    //     </Table.Cell>
    //   )
    //   ii++
    // }

    if (props.selectedInstance.finalReview) {
      let finalReviewPointsCell = (
        <Table.Cell key={i + ii + 1}>
          <p>{finalPoints === undefined ? '-' : finalPoints}</p>
        </Table.Cell>
      )
      indents.push(finalReviewPointsCell)
    }

    return indents
  }

  const createStudentTableRow = (showColumn, data, rowClassName, dropDownTags, dropDownTeachers) => (
    <Table.Row key={data.id} className={rowClassName}>
      {/* Send? */}
      {showColumn('sendcheck') && (
        <Table.Cell>
          <Form.Checkbox name={'send' + data.id} />
        </Table.Cell>
      )}

      {/* Student */}
      <Table.Cell>
        {data.User.firsts} {data.User.lastname} ({data.User.studentNumber})
      </Table.Cell>

      {/* Project Info */}
      <Table.Cell>
        <span>
          {data.projectName}
          <br />
          <a href={data.github} target="_blank" rel="noopener noreferrer">
            {data.github}
          </a>
          {data.Tags.map(tag => (
            <div key={tag.id}>
              <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                {tag.name}
              </Button>
            </div>
          ))}
          {props.allowModify && (
            <Popup trigger={<Icon id="tag" onClick={changeHiddenTagDropdown(data.id)} name="pencil" color="green" style={{ float: 'right', fontSize: '1.25em' }} />} content="Add or remove tag" />
          )}
        </span>
        {props.allowModify && (
          <div>
            {props.coursePageLogic.showTagDropdown === data.id ? (
              <div>
                <Dropdown id="tagDropdown" style={{ float: 'left' }} options={dropDownTags} onChange={changeSelectedTag()} placeholder="Choose tag" fluid selection />
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
          <Table.Cell>
            {(data.weeks.map(week => week.points).reduce((a, b) => a + b, 0) + data.codeReviews.map(cr => cr.points).reduce((a, b) => a + b, 0)).toFixed(2).replace(/[.,]00$/, '')}
          </Table.Cell>
        </Fragment>
      )}

      {/* Instructor */}
      <Table.Cell>
        {data.teacherInstanceId && props.selectedInstance.teacherInstances ? (
          props.selectedInstance.teacherInstances
            .filter(teacher => teacher.id === data.teacherInstanceId)
            .map(teacher => (
              <span key={data.id}>
                {teacher.firsts} {teacher.lastname}
              </span>
            ))
        ) : (
          <span>not assigned</span>
        )}
        {props.allowModify && (
          <Fragment>
            <Popup
              trigger={<Button circular onClick={changeHiddenAssistantDropdown(data.id)} size="small" icon={{ name: 'pencil' }} style={{ margin: '0.25em', float: 'right' }} />}
              content="Assign instructor"
            />
            {props.coursePageLogic.showAssistantDropdown === data.id ? (
              <div>
                <Dropdown id="assistantDropdown" options={dropDownTeachers} onChange={changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
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

      {showColumn('review') && (
        <Fragment>
          {/* Review */}
          <Table.Cell textAlign="right">
            <Link to={`/labtool/browsereviews/${props.selectedInstance.ohid}/${data.id}`}>
              <Popup trigger={<Button circular size="tiny" icon={{ name: 'star', size: 'large', color: 'orange' }} />} content="Review student" />
            </Link>
          </Table.Cell>
        </Fragment>
      )}
    </Table.Row>
  )

  const { columns, filterStudents, rowClassName, disableDefaultFilter } = props

  const showColumn = column => columns.indexOf(column) >= 0

  let dropDownTeachers = []
  dropDownTeachers = createDropdownTeachers(dropDownTeachers)
  let dropDownFilterTeachers = [
    {
      key: 0,
      text: 'no filter',
      value: 0
    }
  ]
  dropDownFilterTeachers = createDropdownTeachers(dropDownFilterTeachers)

  let dropDownTags = []
  dropDownTags = createDropdownTags(dropDownTags)

  // calculate the length of the longest text in a drop down
  const getBiggestWidthInDropdown = dropdownList => {
    const lengths = dropdownList.map(dp => dp.text.length)
    return lengths.reduce((longest, comp) => (longest > comp ? longest : comp), lengths[0])
  }

  return (
    <Fragment>
      <div style={{ textAlign: 'left' }}>
        <span>Filter by instructor </span>
        <Dropdown
          className="aha"
          scrolling
          options={dropDownFilterTeachers}
          onChange={changeFilterAssistant()}
          placeholder="Select Teacher"
          defaultValue={props.coursePageLogic.filterByAssistant}
          selection
          style={{ width: `${getBiggestWidthInDropdown(dropDownFilterTeachers) * 9}px` }}
        />
        <span> Tag filters: </span>

        {props.coursePageLogic.filterByTag.length === 0 ? (
          <span>
            <Label>none</Label>
          </span>
        ) : (
          <span>
            {props.coursePageLogic.filterByTag.map(tag => (
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
              {showColumn('sendcheck') && <Table.HeaderCell key={-2}>Send?</Table.HeaderCell>}
              <Table.HeaderCell key={-1}>Student</Table.HeaderCell>
              <Table.HeaderCell>Project Info</Table.HeaderCell>
              {showColumn('points') && (
                <Fragment>
                  {createHeadersTeacher() /* Week #, Code Review # */}
                  <Table.HeaderCell>Sum</Table.HeaderCell>
                </Fragment>
              )}
              <Table.HeaderCell width="six">Instructor</Table.HeaderCell>
              {showColumn('review') && <Table.HeaderCell>Review</Table.HeaderCell>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.courseData && props.courseData.data ? (
              props.courseData.data
                // remove special filter
                .filter(data => !filterStudents || filterStudents(data))
                // remove students when filtering assistants and it doesn't match
                .filter(
                  data =>
                    disableDefaultFilter ||
                    props.coursePageLogic.filterByAssistant === 0 ||
                    props.coursePageLogic.filterByAssistant === data.teacherInstanceId ||
                    (props.coursePageLogic.filterByAssistant === '-' && data.teacherInstanceId === null)
                )
                // remove students when filtering tags and they don't match
                .filter(data => disableDefaultFilter || props.coursePageLogic.filterByTag.length === 0 || hasFilteringTags(data.Tags, props.coursePageLogic.filterByTag))
                .map(data => createStudentTableRow(showColumn, data, rowClassName, dropDownTags, dropDownTeachers))
            ) : (
              <p />
            )}
          </Table.Body>
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
  filterByAssistant,
  filterByTag,
  getAllTags,
  tagStudent,
  unTagStudent
}

StudentTable.propTypes = {
  rowClassName: PropTypes.string,
  columns: PropTypes.array,
  allowModify: PropTypes.bool,
  filterStudents: PropTypes.func,
  disableDefaultFilter: PropTypes.bool,

  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,

  associateTeacherToStudent: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  filterByAssistant: PropTypes.func.isRequired,
  filterByTag: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired
}

export default connect(
  null,
  mapDispatchToProps
)(StudentTable)
