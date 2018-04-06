import React, { Component } from 'react'
import { Form, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

/*
take some elements from SetEmail.js, if user has already email in db
text should be "Edit your email address" if email can be found from db
*/
class Email extends Component {
    render() {
        return (
            <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center', }}>

                <Grid centered>

                    <Grid.Row>
                        <h3>Please give your email address: </h3>
                    </Grid.Row>
                    <Grid.Row>
                        <p>Email is required because ...</p>
                    </Grid.Row>

                    <Grid.Row>
                        <Form>
                            <Form.Field>
                                <Form.Input
                                    style={{ minWidth: "20em" }}
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    placeholder="my.email@helsinki.fi" />
                            </Form.Field>

                            <Form.Field>
                                <button className="ui left floated green button" type="submit">Save</button>
                                <button className="ui right floated button"> <Link to="/mypage">Cancel</Link></button>
                            </Form.Field>
                        </Form>

                    </Grid.Row>

                </Grid>

            </div>
        )
    }
}

export default Email