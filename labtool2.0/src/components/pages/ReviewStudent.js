import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneWeek } from '../../services/week'

class ReviewStudent extends Component {


  handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const content = {
        points: e.target.points.value,
        studentInstanceId: this.props.studentInstance,
        comment: e.target.comment.value,
        weekNumber: this.props.weekNumber
      }
      const taa = await this.props.createOneWeek(content)
      console.log(taa, 'TÄSSÄ HÄ Ä')
    } catch (error) {
      console.log('EI ONNANNU')
    }
  }
  render() {
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
    ownProps
  }
}

export default connect(mapStateToProps, { createOneWeek })(ReviewStudent)

