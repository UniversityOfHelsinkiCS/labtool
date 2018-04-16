import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'

class ReviewStudent extends Component {
  constructor() {
    super()
    this.state = {
      studentInstance: 'This site is broken if you see this message',
      weekNumber: 'This site is broken if you see this message'
    }
  }


  handleSubmit = async (e) => {
    try {
      e.preventDefault()

      const content = {
        points: e.target.points.value,
        studentInstanceId: 1,
        comment: e.target.comment.value,
        weekNumber: 3
      }
      await this.props.createOneWeek(content)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return (
      <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> Tiralabra 2018 Kevät</h2>
        <h3> {this.state.studentInstance.name} {this.state.weekNumber} </h3>
        <h3> </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable >
              <Form.Field  >
                <label>Points 1-5</label>
                <Input name="points"/>
              </Form.Field>
            </Form.Group>
            <Form.Group inline unstackable>
              <label> Comment </label>
              <Form.TextArea name="comment"/>
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

const mapStateToProps = (state) => {
  return {
  }
}


export default connect(mapStateToProps, { createOneWeek })(ReviewStudent)

