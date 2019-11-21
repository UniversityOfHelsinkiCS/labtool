import React from 'react'
import PropTypes from 'prop-types'
import { Button, Header } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import StudentTable from '../../StudentTable'

export const CoursePageTeacherMain = props => {
  const { loggedInUser, courseData, students, courseId, selectedInstance, coursePageLogic, tags } = props

  let droppedStudentCount = 0
  let activeStudentCount = 0

  // exclude students with mistaken registration completely from the statistics
  students
    .filter(student => student.validRegistration)
    .forEach(student => {
      if (student.dropped) {
        droppedStudentCount++
      } else {
        activeStudentCount++
      }
    })

  const totalStudentCount = activeStudentCount + droppedStudentCount

  return (
    <div className="TeachersBottomView">
      <br />
      <Header as="h2">Students</Header>

      <p>
        {activeStudentCount} active student{activeStudentCount === 1 ? '' : 's'}
        {droppedStudentCount > 0 ? `, ${droppedStudentCount} dropped (${totalStudentCount} in total)` : ''}
      </p>

      <StudentTable
        key={'studentTable'}
        columns={['select', 'points', 'instructor']}
        allowModify={true}
        allowReview={true}
        showCommentNotification={true}
        loggedInUser={loggedInUser}
        selectedInstance={selectedInstance}
        courseData={courseData}
        //coursePage={coursePage}
        studentInstances={students}
        coursePageLogic={coursePageLogic}
        tags={tags}
        persistentFilterKey={`CoursePage_filters_${courseId}`}
      />
      <br />
    </div>
  )
}

CoursePageTeacherMain.propTypes = {
  courseData: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,
  students: PropTypes.array.isRequired,
  loggedInUser: PropTypes.object.isRequired
}

export default CoursePageTeacherMain
