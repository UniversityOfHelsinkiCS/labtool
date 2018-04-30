import React, { Component } from 'react'
import { Button, Table, List, Accordion, Icon, Form, Grid, Input } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneWeek } from '../../services/week'
import { Redirect } from 'react-router'

class BrowseReviews extends Component {
    componentDidUpdate() {
    if (this.props.notification.error !== undefined) {
      if (!this.props.notification.error) {
        this.props.history.push(`/labtool/courses/${this.props.selectedInstance.ohid}`)
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props === nextProps) {
      return false
    }
    return true
  }

  state = { activeIndex: 0 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }
  handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        comment: e.target.comment.value,
        weekNumber: this.props.weekNumber
      }
      await this.props.createOneWeek(content)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
     

    const headers = []
    const createHeaders = () => {
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(
        <Accordion fluid styled>
        <Accordion.Title active={activeIndex === i} index={i} onClick={this.handleClick}>  
        <Icon name='dropdown' /> Week {i + 1} </Accordion.Title> 
        <Accordion.Content active={activeIndex === i}> 
        <p>      <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> {this.props.selectedInstance.name}</h2>
        <h3> Viikko {this.props.weekNumber} </h3>
        {console.log(this.props, "tämä on ownspropsi")}
        <p>joku alla</p>
        <h3> {this.props.joku} </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable >
              <Form.Field  >
                <label>Points 0-{this.props.selectedInstance.weekMaxPoints}</label>
                <Input name="points" />
              </Form.Field>
            </Form.Group>
            <Form.Group inline unstackable>
              <label> Comment </label>
              <Form.TextArea name="comment" />
            </Form.Group>
            <Form.Field>
              <Button className="ui left floated green button" type='submit'>Save</Button>
              <Link to="/labtool/coursepage" type="Cancel">
                <Button className="ui right floated button" type="cancel">Cancel</Button>
              </Link>
            </Form.Field>
          </Form>
        </Grid>
      </div></p>  
        </Accordion.Content>
        </Accordion>)
      }
      return headers
    }
    const { activeIndex } = this.state

    return (
      <div>
        {createHeaders()}
        </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    ownProps,
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage
  }
}

export default connect(mapStateToProps, { createOneWeek })(BrowseReviews)