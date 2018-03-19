import React from 'react'
import studentinstancesService from '../../services/studentinstances'


class RegisterPage extends React.Component {

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

  render() {
    return (
      <div className="Register" style={{ textAlignVertical: 'center', textAlign: 'center', }} >
        <h3>Register for {this.props.courseinstance.name}</h3>

        <form onSubmit={this.postCourseinstanceRegisteration} >
          <label >
            GitHub link: <br />
            <input type="url"  className="form-control1" name="github" required={true} />
          </label>
          <br />
          <label>
            Project name:  <br />
            <input type="text"  className="form-control2" name="projectname" required />
          </label> <br />

          <button type="submit">Submit</button>
        </form>
        
      </div>
    )
  }
}
//<button onClick={cancel}>Cancel</button>


export default RegisterPage
