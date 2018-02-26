import React from 'react'

const CourseInstance = ({ instance, handleFieldChange }) => {
  return(
    <li> {instance.name} <button onClick={handleFieldChange} name="courseInstanceId" value={instance.id}>Register</button>
    </li>
  )
}

export default CourseInstance