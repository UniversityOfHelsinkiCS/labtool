import React from 'react'
import PropTypes from 'prop-types'
import { Button, Header } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

import StudentTable from '../../StudentTable'

export const CoursePageTeacherMain = props => {
  const { courseData, students, droppedTagExists, markAllWithDroppedTagAsDropped, courseId, selectedInstance, coursePageLogic, tags } = props

  let droppedStudentCount = 0
  let activeStudentCount = 0

  students.forEach(student => {
    if (student.dropped) {
      droppedStudentCount++
    } else {
      activeStudentCount++
    }
  })

  const totalStudentCount = activeStudentCount + droppedStudentCount

  const dropConvertButton = droppedTagExists() && (
    <Button onClick={() => markAllWithDroppedTagAsDropped(courseData)} size="small">
      Mark all with dropped tag as dropped out
    </Button>
  )
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
        selectedInstance={selectedInstance}
        studentInstances={students}
        coursePageLogic={coursePageLogic}
        tags={tags}
        persistentFilterKey={`CoursePage_filters_${courseId}`}
      />
      <br />
      {dropConvertButton}
      {
        <Link to={`/labtool/massemail/${selectedInstance.ohid}`}>
          <Button size="small">Send email to multiple students</Button>
        </Link>
      }
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

  droppedTagExists: PropTypes.func.isRequired,
  markAllWithDroppedTagAsDropped: PropTypes.func.isRequired
}

export default CoursePageTeacherMain
