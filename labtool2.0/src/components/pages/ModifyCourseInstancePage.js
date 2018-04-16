import React, { Component } from 'react'
import { Form, Input, Button, Grid } from 'semantic-ui-react'
import { modifyOneCI } from '../../services/courseInstance'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Redirect } from 'react-router'

class ModifyCourseInstancePage extends Component {

  state = {
    redirectToNewPage: false
  }

  handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const content = {
        weekAmount: e.target.weekAmount.value,
        weeklyMaxpoints: e.target.weeklyMaxpoints.value,
        currentWeek: e.target.currentWeek.value,
        courseActive: e.target.courseActive.value,
        ohid: this.props.selectedInstance.ohid
      }
      await this.props.modifyOneCI(content, this.props.selectedInstance.ohid)
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
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <Grid>
          <Grid.Row centered>
            <h2> Edit {this.props.selectedInstance.name} </h2>
          </Grid.Row>
        </Grid>
        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field inline>
                <label>Week amount</label>
                <Input
                  placeholder="weekAmount"
                  type="text"
                  className="form-control1"
                  name="weekAmount"
                  placeholder={`${this.props.selectedInstance.weekAmount}`}
                  required
                />
              </Form.Field>
              <Form.Field inline>
                <label>Weekly maxpoints</label>
                <Input
                  className="form-control2"
                  name="weeklyMaxpoints"
                  placeholder={`${this.props.selectedInstance.weekMaxPoints}`}
                  required />
              </Form.Field>
              <Form.Field inline>
                <label>Current week</label>
                <Input
                  className="form-control3"
                  name="currentWeek"
                  placeholder={`${this.props.selectedInstance.currentWeek}`}
                  required />
              </Form.Field>

              <Form.Field inline>
                <label>Course active</label>
                <Input type='checkbox'
                  className="form-control4"
                  name="courseActive"
                  placeholder="CourseActive" 
                /* checked={this.props.selectedInstance.courseActive} */ />
              </Form.Field>
              <Form.Field>
                <Button floated='left' color='green' type='submit'>Save</Button>
                <Link to="/labtool/courses"><button className="ui right floated button" type="Cancel"> Cancel</button></Link>
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
    selectedInstance: state.selectedInstance
  }
}

export default connect(mapStateToProps, { modifyOneCI })(ModifyCourseInstancePage)