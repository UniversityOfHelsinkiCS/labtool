import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'
import { Redirect } from 'react-router'

class ReviewStudent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirectToNewPage: false
    }
  }

  componentDidUpdate() {
    if (!this.props.notification.error) {
      this.setState({ redirectToNewPage: true })
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.notification === nextProps.notification) {
      return false
    }
    return true
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
    if (this.state.redirectToNewPage) {
      return (
        <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
      )
    }
    return (
      <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> Tiralabra 2018 Kevät</h2>
        <h3> Viikko {this.props.weekNumber} </h3>
        <h3> </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable >
              <Form.Field  >
                <label>Points 1-5</label>
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
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {

  return {
    ownProps,
    selectedInstance: state.selectedInstance,
    notification: state.notification
  }
}

export default connect(mapStateToProps, { createOneWeek })(ReviewStudent)

