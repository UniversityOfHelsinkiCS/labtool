import React from 'react'
import PropTypes from 'prop-types'
import { Header } from 'semantic-ui-react'

import { formatCourseName } from '../../../util/format'

export const CoursePageHeader = ({ courseInstance }) => (
  <Header as="h2" style={{ marginBottom: '1em' }}>
    <Header.Content>
      {formatCourseName(courseInstance.name, courseInstance.ohid, courseInstance.start)}
      <Header.Subheader>
        {courseInstance.coursesPage && <a href={courseInstance.coursesPage}>courses.helsinki.fi</a>} {courseInstance.coursesPage && courseInstance.courseMaterial && '|'}{' '}
        {courseInstance.courseMaterial && <a href={courseInstance.courseMaterial}>Course material</a>}
      </Header.Subheader>
    </Header.Content>
  </Header>
)

CoursePageHeader.propTypes = {
  courseInstance: PropTypes.object.isRequired
}

export default CoursePageHeader
