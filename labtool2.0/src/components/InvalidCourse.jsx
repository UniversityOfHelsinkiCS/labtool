import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Confirm, Label } from 'semantic-ui-react'

// A course registered or imported by mistake can be marked invalid (#905). Only its staff and sysops see
// it, struck through and at the bottom of course lists; for students it disappears.

export const invalidCourseStyle = { textDecoration: 'line-through', color: 'grey' }

export const InvalidCourseLabel = () => (
  <Label className="invalidCourseLabel" size="mini" color="red" basic style={{ marginLeft: '6px' }}>
    Invalid
  </Label>
)

/**
 * The course name, struck through when the course is invalid.
 */
export const CourseName = ({ course, children }) =>
  course.invalid ? (
    <>
      <span className="invalidCourseName" style={invalidCourseStyle}>
        {children}
      </span>
      <InvalidCourseLabel />
    </>
  ) : (
    children
  )

CourseName.propTypes = {
  course: PropTypes.object.isRequired,
  children: PropTypes.node
}

/**
 * Marks the course invalid, or restores it, after a confirmation.
 */
export const MarkInvalidButton = ({ course, setCourseInvalid, size }) => {
  const [confirming, setConfirming] = useState(false)
  const invalid = Boolean(course.invalid)

  return (
    <>
      <Button
        type="button"
        className="markInvalidButton"
        size={size}
        color={invalid ? 'green' : 'red'}
        basic={!invalid}
        icon={invalid ? 'undo' : 'ban'}
        content={invalid ? 'Restore course' : 'Mark course as invalid'}
        onClick={() => setConfirming(true)}
      />
      <Confirm
        className="markInvalidConfirm"
        open={confirming}
        header={invalid ? 'Restore the course?' : 'Mark the course as invalid?'}
        content={
          invalid
            ? `${course.name} will be in use again: its students see it and new students can register.`
            : `Use this for a course that was registered or imported by mistake. ${course.name} disappears from its students and cannot be registered to; only its teachers and admins see it. Nothing is deleted, and the course can be restored.`
        }
        confirmButton={invalid ? 'Restore course' : 'Mark invalid'}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          setCourseInvalid(course.ohid, !invalid)
        }}
      />
    </>
  )
}

MarkInvalidButton.propTypes = {
  course: PropTypes.object.isRequired,
  setCourseInvalid: PropTypes.func.isRequired,
  size: PropTypes.string
}
