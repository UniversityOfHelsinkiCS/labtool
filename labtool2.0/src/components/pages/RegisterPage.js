import React, { Component } from 'react'
import { Form, Input, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStudentCourses } from '../../services/studentinstances'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { Redirect } from 'react-router'
import { getOneCI } from '../../services/courseInstance'

/**
 * The page user uses to register to a course AS A STUDENT
 */

export class RegisterPage extends Component {
  state = {
    redirectToNewPage: false,
    loading: false
  }

  handleSubmit = async e => {
    try {
      e.preventDefault()

      this.setState({ loading: true })
      if (this.props.selectedInstance.registrationAtWebOodi) {
        const data = {
          projectname: e.target.projectName.value,
          github: e.target.github.value,
          ohid: this.props.selectedInstance.ohid
        }
        await this.props.updateStudentProjectInfo(data)
      } else {
        const content = {
          projectName: e.target.projectName.value,
          github: e.target.github.value,
          ohid: this.props.selectedInstance.ohid
        }
        await this.props.createStudentCourses(content, this.props.selectedInstance.ohid)
      }
      this.setState({ redirectToNewPage: true })
    } catch (error) {
      console.log(error)
    }
  }

  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
  }

  render() {
    if (this.state.redirectToNewPage) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }

    return (
      <div
        className="RegisterPage"
        style={{
          textAlignVertical: 'center',
          textAlign: 'center'
        }}
      >
        <Loader active={this.state.loading} inline="centered" />
        <Grid>
          <Grid.Row centered>
            {this.props.selectedInstance.registrationAtWebOodi ? (
              <div>
                <h3>Update your info for {this.props.selectedInstance.name}</h3>
              </div>
            ) : (
              <div>
                <h3>Register for {this.props.selectedInstance.name}</h3>
              </div>
            )}
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '100px', textAlign: 'left' }}>Project name</label>
                <Input icon="rocket" iconPosition="left" type="text" className="form-control1" name="projectName" placeholder="MyProjectName" required style={{ minWidth: '30em' }} />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '100px', textAlign: 'left' }}>GitHub link</label>
                <Input icon="github" iconPosition="left" type="url" className="form-control2" name="github" placeholder="https://github.com/myaccount/myrepo" required style={{ minWidth: '30em' }} />
              </Form.Group>

              <Form.Field>
                <button className="ui left floated blue button" type="submit">
                  {' '}
                  Submit
                </button>
                <Link to={`/labtool/courses/${this.props.selectedInstance.ohid}`}>
                  {' '}
                  <button className="ui right floated button" type="Cancel">
                    Cancel
                  </button>
                </Link>
              </Form.Field>
            </Form>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedInstance: state.selectedInstance,
    courseId: ownProps.courseId
  }
}

export default connect(mapStateToProps, { createStudentCourses, updateStudentProjectInfo, getOneCI })(RegisterPage)
