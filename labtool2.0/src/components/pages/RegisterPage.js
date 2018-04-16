import React, { Component } from 'react'
import { Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStudentCourses } from '../../services/studentinstances'
import { Redirect } from 'react-router'

class RegisterPage extends Component {

  state = {
    redirectToNewPage: false
  }

   handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const content = {
        projectName: e.target.projectName.value,
        github: e.target.github.value,
        ohid: this.props.selectedInstance.ohid
      }
      await this.props.createStudentCourses(content, this.props.selectedInstance.ohid)
      this.setState({ redirectToNewPage: true })
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (this.state.redirectToNewPage) {
      return (
      <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
      )
    }


    return (

      <div className="RegisterPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center',
        }}>

        <Grid>
          <Grid.Row centered>
            <h3>Register for {this.props.selectedInstance.name}</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>

            <Form onSubmit={this.handleSubmit}>

              <Form.Field inline>
                <label> Project name </label>
                <Input
                  style={{ minWidth: '20em' }}
                  type="text"
                  className="form-control1"
                  name="projectName"
                  placeholder="MyProjectName"
                  required />
              </Form.Field>

              <Form.Field inline>
                <label> GitHub link </label>
                <Input
                  style={{ minWidth: '20em' }}
                  type="url"
                  className="form-control2"
                  name="github"
                  placeholder="https://github.com/myaccount/myrepo"
                  required />
              </Form.Field>

              <Form.Field>
             <button className="ui left floated blue button" type="submit"> Submit</button> 
              <Link to="/labtool/coursepage"> <button className="ui right floated button" type="Cancel">Cancel</button></Link>
              </Form.Field>

            </Form>
          </Grid.Row>
        </Grid>
      </div >
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance
  }
}

export default connect(mapStateToProps, { createStudentCourses })(RegisterPage)

