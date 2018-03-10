import React from 'react'

const CourseInstance = ({ instance, handleFieldChange }) => {
  return(
    <li style={{ textAlignVertical: 'center', textAlign: 'center' }}> {instance.name} <button name={instance.name} onClick={handleFieldChange} value={instance.id}>Register</button>
    </li>
  )
}

export default CourseInstance