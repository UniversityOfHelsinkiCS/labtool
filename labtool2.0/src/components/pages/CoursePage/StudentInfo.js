import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Message } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export const CoursePageStudentInfo = props => {
  const { selectedInstance, courseData } = props

  if (!(courseData && courseData.data)) {
    return <div />
  }

  return (
    <div key="student info">
      {courseData.data.User ? (
        <div>
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
          {!courseData.data.validRegistration && (
            <>
              <Message negative>
                <Message.Header>Your registration has been marked as invalid</Message.Header>
                <p>This means you likely registered on this course by mistake. If this is not the case, please contact the teacher of the course.</p>
              </Message>
              <br />
            </>
          )}
          {courseData.data.dropped && (
            <>
              <Message>
                <Message.Header>You have been marked as dropped out from this course</Message.Header>
                <p>Your further course submissions will likely not be graded. If this is a mistake, please contact the teacher of the course.</p>
              </Message>
              <br />
            </>
          )}
        </div>
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
