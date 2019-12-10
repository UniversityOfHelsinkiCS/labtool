import React from 'react'
import PropTypes from 'prop-types'
import { Table, Checkbox } from 'semantic-ui-react'

import { Points } from '../Points'
import StudentInfoCell from './StudentInfoCell'
import ProjectInfoCell from './ProjectInfoCell'
import PointCells from './PointCells'
import InstructorInfoCell from './InstructorInfoCell'
import GradeCell from './GradeCell'

export const StudentTableRow = props => {
  const {
    showColumn,
    data,
    extraColumns,
    dropDownTags,
    dropDownTeachers,
    shouldHideInstructor,
    shouldHideGrade,
    extraStudentIcon,
    allowReview,
    allowModify,
    addFilterTag,
    coursePageLogic,
    studentInstances,
    selectStudent,
    unselectStudent,
    showTagDropdown
  } = props

  const handleSelectCheck = id => (e, data) => {
    const { checked } = data
    if (checked) {
      selectStudent(id)
    } else {
      unselectStudent(id)
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

      {/* Grade */}
      {showColumn('grade') && !shouldHideGrade && <GradeCell studentId={data.id} />}

      {/* Instructor */}
      {showColumn('instructor') && !shouldHideInstructor(studentInstances) && <InstructorInfoCell studentId={data.id} allowModify={allowModify} dropDownTeachers={dropDownTeachers} />}

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
  coursePageLogic: PropTypes.object.isRequired,

  updateStudentProjectInfo: PropTypes.func.isRequired,
  showTagDropdown: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  selectStudent: PropTypes.func.isRequired,
  unselectStudent: PropTypes.func.isRequired,
  shouldHideGrade: PropTypes.bool
}

export default StudentTableRow
