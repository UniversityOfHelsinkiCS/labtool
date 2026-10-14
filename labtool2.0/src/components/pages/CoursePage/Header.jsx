import React from 'react'
import PropTypes from 'prop-types'
import { Header } from 'semantic-ui-react'

import { formatCourseName } from '../../../util/format'
import { safeHref } from '../../../util/links'

export const CoursePageHeader = ({ courseInstance }) => {
  if (!courseInstance) {
    return <div />
  }

  return (
    <Header as="h2" style={{ marginBottom: '1em' }}>
      <Header.Content>
        {formatCourseName(courseInstance.name, courseInstance.ohid, courseInstance.start)}
        <Header.Subheader>
          {courseInstance.coursesPage && (
            <a href={safeHref(courseInstance.coursesPage)}>studies.helsinki.fi</a>
          )}{' '}
          {courseInstance.coursesPage && courseInstance.courseMaterial && '|'}{' '}
          {courseInstance.courseMaterial && (
            <a href={safeHref(courseInstance.courseMaterial)}>Course material</a>
          )}
        </Header.Subheader>
      </Header.Content>
    </Header>
  )
}

CoursePageHeader.propTypes = {
  courseInstance: PropTypes.object.isRequired
}

export default CoursePageHeader
