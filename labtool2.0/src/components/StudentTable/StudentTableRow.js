import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Table, Popup, Dropdown, Checkbox } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import RepoLink from '../RepoLink'

export const StudentTableRow = props => {
  const {
    showColumn,
    data,
    extraColumns,
    dropDownTags,
    dropDownTeachers,
    shouldHideInstructor,
    extraStudentIcon,
    allowReview,
    allowModify,
    addFilterTag,
    coursePageLogic,
    selectedInstance,
    studentInstances,
    associateTeacherToStudent,
    selectStudent,
    unselectStudent,
    selectTeacher,
    selectTag,
    showAssistantDropdown,
    showTagDropdown,
    tagStudent,
    unTagStudent
  } = props

  const updateTeacher = id => async e => {
    try {
      e.preventDefault()
      let teacherId = coursePageLogic.selectedTeacher
      if (teacherId === '-') {
        // unassign
        teacherId = null
      }

      const data = {
        studentInstanceId: id,
        teacherInstanceId: teacherId
      }
      await associateTeacherToStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectCheck = id => (e, data) => {
    const { checked } = data
    if (checked) {
      selectStudent(id)
    } else {
      unselectStudent(id)
    }
  }

  const changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      selectTeacher(value)
    }
  }

  const changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      selectTag(value)
    }
  }

  const changeHiddenAssistantDropdown = id => {
    return () => {
      showAssistantDropdown(coursePageLogic.showAssistantDropdown === id ? '' : id)
    }
  }

  const changeHiddenTagDropdown = id => {
    return () => {
      showTagDropdown(coursePageLogic.showTagDropdown === id ? '' : id)
    }
  }

  const addTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: coursePageLogic.selectedTag
      }
      await tagStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const removeTag = (id, tag) => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: tag || coursePageLogic.selectedTag
      }
      await unTagStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  const createWeekHeaders = (weeks, codeReviews, siId) => {
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
      if (weeks[j].weekNumber === selectedInstance.weekAmount + 1) {
        finalPoints = weeks[j].points
      } else if (weeks[j].weekNumber) {
        weekPoints[weeks[j].weekNumber] = weeks[j].points
      }
    }
    for (; i < selectedInstance.weekAmount; i++) {
      // we have <br /> to make this easier to click, but it'd be better
      // if we could Link an entire Table.Cell, this however breaks formatting
      // completely.

      indents.push(
        <Table.Cell selectable key={'week' + i} textAlign="center" style={{ position: 'relative' }}>
          <Link
            style={{ ...tableCellLinkStyle, ...flexCenter }}
            key={'week' + i + 'link'}
            to={
              weekPoints[i + 1] === undefined
                ? `/labtool/reviewstudent/${selectedInstance.ohid}/${siId}/${i + 1}`
                : { pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i } }
            }
          >
            {selectedInstance.currentWeek === i + 1 && weekPoints[i + 1] === undefined ? (
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'star', color: 'white', size: 'large' }} />} content="Review" />
            ) : (
              <p>{weekPoints[i + 1] !== undefined ? weekPoints[i + 1] : '-'}</p>
            )}
          </Link>
        </Table.Cell>
      )
    }

    let ii = 0
    const { amountOfCodeReviews } = selectedInstance
    if (amountOfCodeReviews) {
      for (let index = 1; index <= amountOfCodeReviews; index++) {
        indents.push(
          <Table.Cell selectable key={siId + index} textAlign="center" style={{ position: 'relative' }}>
            <Link
              className="codeReviewPoints"
              style={tableCellLinkStyle}
              key={'codeReview' + i + ii + 'link'}
              to={{ pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i + ii } }}
            >
              <p style={flexCenter}>{cr[index] || cr[index] === 0 ? cr[index] : '-'}</p>
            </Link>
          </Table.Cell>
        )
        ++ii
      }
    }

    if (selectedInstance.finalReview) {
      let finalReviewPointsCell = (
        <Table.Cell selectable key={i + ii + 1} textAlign="center" style={{ position: 'relative' }}>
          <Link
            style={tableCellLinkStyle}
            key={'finalReviewlink'}
            to={
              finalPoints === undefined
                ? `/labtool/reviewstudent/${selectedInstance.ohid}/${siId}/${i + 1}`
                : { pathname: `/labtool/browsereviews/${selectedInstance.ohid}/${siId}`, state: { openAllWeeks: true, jumpToReview: i + ii } }
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

  return (
    <Table.Row key={data.id} className={data.dropped ? 'TableRowForDroppedOutStudent' : 'TableRowForActiveStudent'}>
      {/* Select Check Box */}
      {showColumn('select') && (
        <Table.Cell key="select">
          <Checkbox id={'select' + data.id} checked={coursePageLogic.selectedStudents[data.id] || false} onChange={handleSelectCheck(data.id)} />
        </Table.Cell>
      )}

      {/* Student */}
      <Table.Cell key="studentinfo">
        {allowReview ? (
          <Link to={`/labtool/browsereviews/${selectedInstance.ohid}/${data.id}`}>
            <Popup
              trigger={
                <span>
                  {extraStudentIcon && extraStudentIcon(data)}
                  {data.User.firsts} {data.User.lastname}
                  <br />({data.User.studentNumber})
                </span>
              }
              content={data.dropped ? 'Review student (this student has dropped out)' : 'Review student'}
            />
          </Link>
        ) : (
          <span>
            {extraStudentIcon && extraStudentIcon(data)}
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
          <RepoLink url={data.github} />
          {data.Tags.map(tag => (
            <div key={data.id + ':' + tag.id}>
              <Button.Group className={'mini'}>
                <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={addFilterTag(tag)}>
                  {tag.name}
                </Button>
                {allowModify && (
                  <Button compact icon attached="right" className={`mini ui ${tag.color} button`} style={{ paddingLeft: 0, paddingRight: 0 }} onClick={removeTag(data.id, tag.id)}>
                    <Icon name="remove" />
                  </Button>
                )}
              </Button.Group>
            </div>
          ))}
          {allowModify && (
            <Popup
              trigger={<Icon id={'tagModify'} onClick={changeHiddenTagDropdown(data.id)} name="pencil" color="green" style={{ float: 'right', fontSize: '1.25em' }} />}
              content="Add or remove tag"
            />
          )}
        </span>
        {allowModify && (
          <div>
            {coursePageLogic.showTagDropdown === data.id ? (
              <div>
                <Dropdown id={'tagDropdown'} style={{ float: 'left' }} options={dropDownTags} onChange={changeSelectedTag()} placeholder="Choose tag" fluid selection />
                <br />
                <div className="two ui buttons" style={{ float: 'left' }}>
                  <button className="ui icon positive button" onClick={addTag(data.id)} size="mini">
                    <i className="plus icon" />
                  </button>
                  <div className="or" />
                  <button className="ui icon button" onClick={removeTag(data.id, null)} size="mini">
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
        <>
          {/* Week #, Code Review # */}
          {createWeekHeaders(data.weeks, data.codeReviews, data.id)}

          {/* Sum */}
          <Table.Cell key="pointssum" textAlign="center">
            {(data.weeks.map(week => week.points).reduce((a, b) => a + b, 0) + data.codeReviews.map(cr => cr.points).reduce((a, b) => a + b, 0)).toFixed(2).replace(/[.,]00$/, '')}
          </Table.Cell>
        </>
      )}

      {/* Instructor */}
      {showColumn('instructor') && (!shouldHideInstructor(studentInstances) || allowModify) && (
        <Table.Cell key="instructor">
          {!shouldHideInstructor(studentInstances) &&
            (data.teacherInstanceId && selectedInstance.teacherInstances ? (
              selectedInstance.teacherInstances
                .filter(teacher => teacher.id === data.teacherInstanceId)
                .map(teacher => (
                  <span key={data.id + ':' + teacher.id}>
                    {teacher.firsts} {teacher.lastname}
                  </span>
                ))
            ) : (
              <span>not assigned</span>
            ))}
          {allowModify && (
            <>
              <Popup
                trigger={<Button circular onClick={changeHiddenAssistantDropdown(data.id)} size="small" icon={{ name: 'pencil' }} style={{ margin: '0.25em', float: 'right' }} />}
                content="Assign instructor"
              />
              {coursePageLogic.showAssistantDropdown === data.id ? (
                <div>
                  <Dropdown id={'assistantDropdown'} options={dropDownTeachers} onChange={changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
                  <Button onClick={updateTeacher(data.id, data.teacherInstanceId)} size="small">
                    Change instructor
                  </Button>
                </div>
              ) : (
                <div />
              )}
            </>
          )}
        </Table.Cell>
      )}

      {(extraColumns || []).map(([, cell]) => cell(data))}
    </Table.Row>
  )
}

StudentTableRow.propTypes = {
  showColumn: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  extraColumns: PropTypes.array.isRequired,
  dropDownTags: PropTypes.array.isRequired,
  dropDownTeachers: PropTypes.array.isRequired,
  shouldHideInstructor: PropTypes.func.isRequired,
  allowReview: PropTypes.bool,
  allowModify: PropTypes.bool,
  addFilterTag: PropTypes.func.isRequired,
  extraStudentIcon: PropTypes.func,

  studentInstances: PropTypes.array.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,

  associateTeacherToStudent: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  selectStudent: PropTypes.func.isRequired,
  unselectStudent: PropTypes.func.isRequired
}

export default StudentTableRow
