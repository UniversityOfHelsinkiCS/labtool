import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export const CoursePageStudentInfo = props => {
  const { selectedInstance, courseData } = props

  if (!(courseData && courseData.data)) {
    return <div />
  }

  return (
    <div key="student info">
      {courseData.data.User ? (
        <Card key="card" fluid color="yellow">
          <Card.Content>
            <h2>
              {courseData.data.User.firsts} {courseData.data.User.lastname}
            </h2>
            <h3> {courseData.data.projectName} </h3>
            <h3>
              <a href={courseData.data.github} target="_blank" rel="noopener noreferrer">
                {courseData.data.github}
              </a>{' '}
              <Link to={`/labtool/courseregistration/${selectedInstance.ohid}`}>
                <Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />
              </Link>
            </h3>
          </Card.Content>
        </Card>
      ) : (
        <div />
      )}
    </div>
  )
}

CoursePageStudentInfo.propTypes = {
  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired
}

export default CoursePageStudentInfo
