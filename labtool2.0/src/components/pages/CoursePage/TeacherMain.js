import React from 'react'
import PropTypes from 'prop-types'
import { Button, Header } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import StudentTable from '../../StudentTable'

export const CoursePageTeacherMain = props => {
  const { loggedInUser, courseData, students, courseId, selectedInstance, coursePageLogic, tags, exportCSV } = props

  let droppedStudentCount = 0
  let activeStudentCount = 0

  students.forEach(student => {
    if (student.dropped) {
      droppedStudentCount++
    } else if (student.validRegistration) {
      //exclude students with invalid registration completely from the statistics
      activeStudentCount++
    }
  })

  const totalStudentCount = activeStudentCount + droppedStudentCount

  return (
    <div className="TeachersBottomView">
      <br />
      <Header as="h2">Students</Header>

      <p>
        {activeStudentCount} active student{activeStudentCount === 1 ? '' : 's'}, {droppedStudentCount} dropped student{droppedStudentCount === 1 ? '' : 's'} ({totalStudentCount} in total)
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
      {
        <Link to={`/labtool/massemail/${selectedInstance.ohid}`}>
          <Button size="small">Send email to multiple students</Button>
        </Link>
      }
      <Button size="small" onClick={exportCSV}>
        Export CSV of all students
      </Button>
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

  exportCSV: PropTypes.func.isRequired,
  loggedInUser: PropTypes.object.isRequired
}

export default CoursePageTeacherMain
