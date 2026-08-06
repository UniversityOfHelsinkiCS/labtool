import React from 'react'
import PropTypes from 'prop-types'
import { Button, Message } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import CoursePageHeader from './Header'

export const CoursePageStudentRegister = props => {
  const { selectedInstance, courseData } = props

  return (
    <div className="StudentsView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      <CoursePageHeader courseInstance={selectedInstance} />
      <div className="grid">
        {selectedInstance.active === true ? (
          courseData.data !== null ? (
            <p />
          ) : selectedInstance.registrationAtWebOodi === 'notfound' ? (
            <div className="sixteen wide column">
              <Message compact>
                <Message.Header>No registration found at WebOodi.</Message.Header>
                <p>If you have just registered, please try again in two hours.</p>
              </Message>
            </div>
          ) : (
            <div className="sixteen wide column">
              <Link to={`/labtool/courseregistration/${selectedInstance.ohid}`}>
                {' '}
                <Button color="blue" size="large">
                  Register
                </Button>
              </Link>
            </div>
          )
        ) : (
          <div className="sixteen wide column">
            <Message compact>
              <Message.Header>This course does not have active registration.</Message.Header>
            </Message>
          </div>
        )}
      </div>
    </div>
  )
}

CoursePageStudentRegister.propTypes = {
  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired
}

export default CoursePageStudentRegister
