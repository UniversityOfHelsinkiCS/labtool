import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Message, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

export const CoursePageStudentInfo = props => {
  const { selectedInstance, courseData, removeRegistration } = props

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
                <Link to={`/labtool/courseregistration/${selectedInstance.ohid}`}>
                  <Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />
                </Link>
                <a href={courseData.data.github} target="_blank" rel="noopener noreferrer">
                  {courseData.data.github}
                </a>{' '}
              </h3>
              {courseData.data.repoExists === false && (
                <>
                  <br />
                  <Message warning>
                    <Message.Header>Your project repository might not be accessible</Message.Header>
                    <p>
                      Please verify that the repository exists and that it is not private. To hide this warning, edit your repository by clicking the button on the right, make sure there is no warning
                      (or it goes away) and click &apos;Submit&apos;.
                    </p>
                  </Message>
                </>
              )}
            </Card.Content>
          </Card>
          {courseData.role === 'student' && !courseData.data.validRegistration && (
            <>
              <Message className="mistakenRegistration" negative>
                <Message.Header>Your registration has been marked as mistaken</Message.Header>
                <p>This means you likely registered on this course by mistake. If this is not the case, please contact the teacher of the course.</p>
                <Popup
                  content="You can remove yourself from the course if you registered by mistake."
                  trigger={
                    <Button id="buttonRemoveRegistration" color="red" onClick={() => removeRegistration(courseData.data.id)}>
                      Remove yourself from the course
                    </Button>
                  }
                />
              </Message>
              <br />
            </>
          )}
          {courseData.role === 'student' && courseData.data.validRegistration && courseData.data.dropped && (
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
  courseData: PropTypes.object.isRequired,
  removeRegistration: PropTypes.func.isRequired
}

export default CoursePageStudentInfo
