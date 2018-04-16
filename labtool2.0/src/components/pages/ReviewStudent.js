import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createWeek } from '../../services/week'

class ReviewStudent extends Component {


    render() {
        const user = { ...this.props.user.returnedUser }
        return (
            <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
                <h2> Tiralabra 2018 Kevät</h2>
                <h3> Maija Meikäläinen Week 2 </h3>
                <h3> </h3>
                <Grid centered>
                    <Form >
                        <Form.Group inline unstackable >
                            <Form.Field  >
                                <label>Points 1-5</label>
                                <Input />
                            </Form.Field>
                        </Form.Group>
                        <Form.Group inline unstackable>
                            <label> Comment </label>
                            <Form.TextArea />
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
    user: state.user,
  }
}


export default connect(mapStateToProps, {})(ReviewStudent)

