import React, { Component } from 'react'
import { Form, Input, Button, Grid } from 'semantic-ui-react'

class LoginPage extends Component {

  render() {
    //const LoginPage = ({ postLogin, handleFieldChange, username, password }) => {
    return (

      <div className='ui'>
        <Grid>
          <Grid.Row centered>
            <h3>Enter your University of Helsinki username and password.</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form>

              <Form.Group inline>
                <label>
                  Username
                </label>
                <Input
                  style={{ minWidth: '25em' }}
                  type='text'
                  className='form-control1'
                  placeholder='Your username'
                  //value={username}
                  name="username"
                  icon='user'
                  iconPosition='left'
                  //onChange={handleFieldChange}
                  required />
              </Form.Group>

              <Form.Group inline>
                <label>Password</label>
                <Input
                  type='password'
                  icon='lock'
                  iconPosition='left'
                  className='form-control2'
                  placeholder='Your password'
                  //value={password}
                  name='password'
                  //onChange={handleFieldChange}
                  style={{ minWidth: '25em' }}
                  required />
              </Form.Group>

              <Form.Group inline>
                <Button
                  type='submit'
                  color='blue'>
                  Login
                </Button>
              </Form.Group>

            </Form>

          </Grid.Row>
        </Grid>
      </div>

    )
  }
}


export default LoginPage