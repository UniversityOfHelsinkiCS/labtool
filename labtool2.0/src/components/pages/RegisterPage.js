<<<<<<< HEAD
import React, { Component } from 'react'
import { Form, Input, Button, Grid } from 'semantic-ui-react'

class RegisterPage extends Component {

  render() {
    return (
      <div className="RegisterPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center',
        }}>

        <Grid>
          <Grid.Row centered>
            <h3>Register for *kurssin nimi*</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>

            <Form>

              <Form.Field inline>
                <label> Project name </label>
                <Input
                  style={{ minWidth: "20em" }}
                  type="text"
                  className="form-control1"
                  name="project name"
                  placeholder="MyProjectName"
                  required />
              </Form.Field>

              <Form.Field inline>
                <label> GitHub link </label>
                <Input
                  style={{ minWidth: "20em" }}
                  type="url"
                  className="form-control2"
                  name="github"
                  placeholder="https://github.com/myaccount/myrepo"
                  required />
              </Form.Field>

              <Form.Field>
                <button class="ui left floated blue button" type="submit">Submit</button>
                <button class="ui right floated red button">Cancel</button>
              </Form.Field>

            </Form>
          </Grid.Row>
        </Grid>
      </div >
=======
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
>>>>>>> 745dffc4fa5affbf8f50f8ef7689df531fa7895d
    )
  }
}
//<button onClick={cancel}>Cancel</button>

// const RegisterPage = ({onSubmit, handleFieldChange, projectname, github, cancel, name }) => {

export default RegisterPage
