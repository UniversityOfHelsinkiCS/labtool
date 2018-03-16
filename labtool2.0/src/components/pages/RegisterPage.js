import React from 'react'


const RegisterPage = ({ onSubmit, handleFieldChange, projectname, github, cancel, name }) => {


  postCourseinstanceRegisteration = (event) => {
    event.preventDefault()

    studentinstancesService.create({
      courseInstanceId: this.state.courseInstanceId,
      github: this.state.github,
      projectName: this.state.projectname
    })
    this.setState({
      success: 'Register successful!',
      courseInstanceId: null
    })
    setTimeout(() => {
      this.setState({ success: null })
    }, 5000)
  }
  
  return (
    <div className="Register" style={{ textAlignVertical: 'center', textAlign: 'center', }} >
      <h3>Register for {name}</h3>

      <form onSubmit={onSubmit} >
        <label >
          GitHub link: <br />
          <input type="url" onChange={handleFieldChange} className="form-control1" name="github" required={true} value={github} />
        </label>
        <br />
        <label>

          Project name:  <br />
          <input type="text" onChange={handleFieldChange} className="form-control2" name="projectname" value={projectname} required />
        </label> <br />

        <button type="submit">Submit</button>
      </form>
      <button onClick={cancel}>Cancel</button>
    </div>
  )
}


export default RegisterPage
