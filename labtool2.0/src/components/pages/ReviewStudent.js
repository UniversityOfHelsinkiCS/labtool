import React, { Component } from 'react'
import { Button, Form, Input, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

class ReviewStudent extends Component {

    componentDidMount() {
        console.log(this.props)
    }


    render() {
        const user = { ...this.props.user.returnedUser }
        console.log(this.props)
        return (
            <div className='ReviewStudent' style={{ textAlignVertical: 'center', textAlign: 'center', }}>
                <h2>{this.props.selectedInstance.name}</h2>
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
    selectedInstance: state.selectedInstance,
    coursePage: state.coursePage
  }
}


export default connect(mapStateToProps, {})(ReviewStudent)

