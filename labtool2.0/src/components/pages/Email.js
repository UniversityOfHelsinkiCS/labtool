import React, { Component } from 'react'
import { Form, Input, Button, Grid } from 'semantic-ui-react'

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
                                <button class="ui left floated green button" type="submit">Save</button>
                                <button class="ui right floated button">Cancel</button>
                            </Form.Field>
                        </Form>

                    </Grid.Row>

                </Grid>

            </div>
        )
    }
}

/*
code below from SetEmail.js
*/
// const SetEmail = ({ postEmail, handleFieldChange, handleFirstLoginFalse, email }) => {

//     return (
//         <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center', }}>

//             <form onSubmit={postEmail}>
//                 <label>
//                     Email address: <br />
//                     <input value={email} type="email" className="form-control" name="email" onChange={handleFieldChange} required />
//                 </label>
//                 <button type="submit">Submit</button>
//             </form>

//             <button onClick={handleFirstLoginFalse}>Cancel</button>
//         </div>
//     )
// }

export default Email