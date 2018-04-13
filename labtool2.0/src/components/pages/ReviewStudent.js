import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createWeek } from '../../services/week'
class ReviewStudent extends Component {


  handleSubmit = async (e) => {
    e.preventDefault()

    //CoursePage has to be updated to give WeekNumber and StudentInstanceId as props from table key values
    const data = {
      points: e.target.points.value,
      comment: e.target.comment.value,
      weekNumber: this.props.weekNumber,
      StudentInstanceId: this.props.StudentInstanceId,
      user: this.props.user.username //? No Id in state
    }
    await this.props.createWeek(data)
  }

  render() {
    return (
      <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> Tiralabra 2018 Kevät</h2>
        <h3> Maija Meikäläinen Week 2 </h3>
        <h3> </h3>
        <Grid centered>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group inline unstackable >
              <Form.Field  >
                <label>Points 1-5</label>
                <Input name='points'/>
              </Form.Field>
            </Form.Group>

            <Form.Group inline unstackable>
              <label> Comment </label>
              <Form.TextArea name='comment' />
            </Form.Group>

            <Form.Field>
              <Button color='green' type='submit'>Save</Button>
              <Button floated='right' color='red'>
                <Link to="/labtool/coursepage">Cancel</Link></Button>
            </Form.Field>

          </Form>

        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}


export default connect(mapStateToProps, { createWeek })(ReviewStudent)

