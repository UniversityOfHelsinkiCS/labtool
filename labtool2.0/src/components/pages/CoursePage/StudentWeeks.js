import React from 'react'
import PropTypes from 'prop-types'

import WeekReviews from '../../WeekReviews'

export const CoursePageStudentWeeks = props => {
  const { courseId, courseData } = props

  if (!(courseData && courseData.data)) {
    return <div />
  }

  return <div>{courseData.data.weeks && <WeekReviews courseId={courseId} student={courseData.data} />}</div>
}

CoursePageStudentWeeks.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseData: PropTypes.object.isRequired
}

export default CoursePageStudentWeeks
