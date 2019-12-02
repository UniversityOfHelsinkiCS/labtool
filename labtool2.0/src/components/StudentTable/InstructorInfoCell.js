import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table, Popup, Dropdown, Button } from 'semantic-ui-react'

import { associateTeacherToStudent } from '../../services/assistant'
import { showAssistantDropdown } from '../../reducers/coursePageLogicReducer'

export const InstructorInfoCell = ({ studentData, teacherInstances, showAssistantDropdown, assistantDropdownToShow, associateTeacherToStudent, allowModify, dropDownTeachers }) => {
  const updateTeacher = id => (e, { value }) => {
    if (!value) {
      return
    }
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
    associateTeacherToStudent(data)
  }

  const changeHiddenAssistantDropdown = id => {
    return () => {
      showAssistantDropdown(showAssistantDropdown === id ? '' : id)
    }
  }

  return (
    <Table.Cell>
      {studentData.teacherInstanceId && teacherInstances ? (
        teacherInstances
          .filter(teacher => teacher.id === studentData.teacherInstanceId)
          .map(teacher => (
            <span key={teacher.id}>
              {teacher.firsts} {teacher.lastname}
            </span>
          ))
      ) : (
        <span>not assigned</span>
      )}
      {allowModify && (
        <>
          <Popup
            trigger={<Button circular onClick={changeHiddenAssistantDropdown(studentData.id)} size="small" icon={{ name: 'pencil' }} style={{ margin: '0.25em', float: 'right' }} />}
            content="Assign instructor"
          />
          {assistantDropdownToShow === studentData.id ? (
            <div>
              <Dropdown
                id={'assistantDropdown'}
                selectOnBlur={false}
                upward={false}
                options={dropDownTeachers}
                onChange={updateTeacher(studentData.id, studentData.teacherInstanceId)}
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
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    teacherInstances: state.selectedInstance.teacherInstances,
    assistantDropdownToShow: state.coursePageLogic.showAssistantDropdown,
    studentData: state.coursePage.data.find(student => student.id === ownProps.studentId)
  }
}

const mapDispatchToProps = {
  associateTeacherToStudent,
  showAssistantDropdown
}

InstructorInfoCell.propTypes = {
  assistantDropdownToShow: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]),
  studentData: PropTypes.object.isRequired,
  teacherInstances: PropTypes.array,
  associateTeacherToStudent: PropTypes.func.isRequired,
  showAssistantDropdown: PropTypes.func.isRequired,
  allowModify: PropTypes.bool,
  dropDownTeachers: PropTypes.array.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InstructorInfoCell)
