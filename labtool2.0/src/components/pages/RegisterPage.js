import React, { Component } from 'react'
import { Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStudentCourses } from '../../services/studentinstances'

class RegisterPage extends Component {
  

  handleSubmit = async (e) => {
    e.preventDefault()

    const content = {
      projectName: e.target.projectName.value,
      github: e.target.github.value,
      ohid: this.props.courseinstance
    }
    await this.props.createStudentCourses(content, this.props.courseinstance)
  }

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

            <Form onSubmit={this.handleSubmit}>

              <Form.Field inline>
                <label> Project name </label>
                <Input
                  style={{ minWidth: "20em" }}
                  type="text"
                  className="form-control1"
                  name="projectName"
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
                <button className="ui left floated blue button" type="submit">Submit</button>
                <button className="ui right floated button"><Link to = "/coursepage">Cancel</Link></button>
              </Form.Field>

            </Form>
          </Grid.Row>
        </Grid>
      </div >
    )
  }
}

// const RegisterPage = ({onSubmit, handleFieldChange, projectname, github, cancel, name }) => {

export default connect(null, { createStudentCourses }) (RegisterPage)
