import React from 'react'


const RegisterPage = ({ onSubmit, handleFieldChange, projectname, github }) => {

  return (
    <div className="Register" style={{ textAlignVertical: "center", textAlign: "center", }} >
      <h3>Register for TiraLabra</h3>

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
    </div>
  )
}


export default RegisterPage
