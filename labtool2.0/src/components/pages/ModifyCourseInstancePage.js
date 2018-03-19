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
            <Input />
          </Form.Field>
          <Form.Field inline>
            <label>Weekly maxpoints</label>
            <Input />
          </Form.Field>
          <Form.Field inline>
            <label>Current week</label>
            <Input />
          </Form.Field>
     
          <Form.Field inline>
            <label>Course active</label>
            <Input type='checkbox'/>
        </Form.Field>
            <Button color='green' type='submit'>Save</Button>
      </Form>
      </div>
        )
      }
    }
    
export default ModyfyCourseInstancePage