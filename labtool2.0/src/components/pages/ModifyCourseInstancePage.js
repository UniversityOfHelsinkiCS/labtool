import React, { Component } from 'react'
import { Form, Input, Button } from 'semantic-ui-react'

class ModyfyCourseInstancePage extends Component {
  render() {
    return (
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2> Edit Tiralabra 2018 kevät </h2>
        <Form>
          <Form.Field inline>
            <label>Week amount</label>
            <Input
              type="text"
              className="form-control1"
              name="week amount"
              placeholder="WeekAmount"
              required />
          </Form.Field>
          <Form.Field inline>
            <label>Weekly maxpoints</label>
            <Input
              className="form-control2"
              name="weekly maxpoints"
              placeholder="WeeklyMaxpoints"
              required />
          </Form.Field>
          <Form.Field inline>
            <label>Current week</label>
            <Input
              className="form-control3"
              name="current week"
              placeholder="CurrentWeek"
              required />
          </Form.Field>

          <Form.Field inline>
            <label>Course active</label>
            <Input type='checkbox'
              className="form-control4"
              name="course active"
              placeholder="CourseActive" />
          </Form.Field>
          <Button color='green' type='submit'>Save</Button>
        </Form>
      </div>
    )
  }
}

export default ModyfyCourseInstancePage