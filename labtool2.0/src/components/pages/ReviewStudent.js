import React, { Component } from 'react'
import { Button, Form, Input, TextArea, Grid } from 'semantic-ui-react'

class ReviewStudent extends Component {


    render() {
        return (
            <div className="ReviewStudent" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
                <h2> Tiralabra 2018 Kevät</h2>
                <h3> Maija Meikäläinen Week 2 </h3>
                <h3> </h3>
               <Grid centered>
                <Form >
                    <Form.Group inline unstackable >
                        <Form.Field  >
                            <label>Points</label>
                            <Input  />
                        </Form.Field>
                    </Form.Group>
                    <Form.Group inline unstackable>
                    <label> Comment </label>
                    <Form.TextArea />
                    </Form.Group>
                    <Button color='green' type='submit'>Save</Button>
                </Form>
               
                </Grid>
            </div>
        )
    }
}

export default ReviewStudent