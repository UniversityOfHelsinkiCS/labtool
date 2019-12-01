import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Table, Popup, Dropdown, Checkbox } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import RepoLink from '../RepoLink'

import { Points } from '../Points'
import StudentInfoCell from './StudentInfoCell'
import ProjectInfoCell from './ProjectInfoCell'
import PointCells from './PointCells'

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
    loggedInUser,
    coursePageLogic,
    selectedInstance,
    courseData,
    studentInstances,
    associateTeacherToStudent,
    selectStudent,
    unselectStudent,
    showAssistantDropdown,
    showTagDropdown
  } = props

  const updateTeacher = id => async (e, { value }) => {
    if (!value) {
      return
    }
    try {
      e.preventDefault()
      let teacherId = value
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

  return (
    <Table.Row key={data.id} className={data.dropped || !data.validRegistration ? 'TableRowForDroppedOutStudent' : 'TableRowForActiveStudent'}>
      {/* Select Check Box */}
      {showColumn('select') && (
        <Table.Cell key="select">
          <Checkbox id={'select' + data.id} checked={coursePageLogic.selectedStudents[data.id] || false} onChange={handleSelectCheck(data.id)} />
        </Table.Cell>
      )}

      <StudentInfoCell studentId={data.id} extraStudentIcon={extraStudentIcon} allowReview={allowReview} />

      <ProjectInfoCell studentId={data.id} dropDownTags={dropDownTags} addFilterTag={addFilterTag} changeHiddenTagDropdown={changeHiddenTagDropdown} allowModify={allowModify} />

      {showColumn('points') && (
        <>
          <PointCells studentId={data.id} />

          {/* Sum */}
          <Table.Cell key="pointssum" textAlign="center">
            <Points points={data.weeks.map(week => week.points).reduce((a, b) => a + b, 0) + data.codeReviews.map(cr => cr.points).reduce((a, b) => a + b, 0)} />
          </Table.Cell>
        </>
      )}

      {/* Instructor */}
      {showColumn('instructor') && !shouldHideInstructor(studentInstances) && (
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
                  <Dropdown
                    id={'assistantDropdown'}
                    selectOnBlur={false}
                    upward={false}
                    options={dropDownTeachers}
                    onChange={updateTeacher(data.id, data.teacherInstanceId)}
                    placeholder="Select teacher"
                    fluid
                    selection
                  />
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
  showCommentNotification: PropTypes.bool,
  addFilterTag: PropTypes.func.isRequired,
  extraStudentIcon: PropTypes.func,

  studentInstances: PropTypes.array.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,

  associateTeacherToStudent: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  selectStudent: PropTypes.func.isRequired,
  unselectStudent: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object,
  courseData: PropTypes.object
}

export default StudentTableRow
