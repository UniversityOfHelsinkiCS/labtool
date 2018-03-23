import { connect } from 'react-redux'
import { login } from '../../services/login'
import React from 'react'
import { Form, Input, Button, Grid } from 'semantic-ui-react'

class LoginPage extends React.Component {

  handleSubmit = async (e) => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    await this.props.login(content)
  }

  componentWillReceiveProps(nProps) {
    // Kutsutaan kun kirjautuminen onnistuu -->
    window.localStorage.setItem('loggedLabtool', JSON.stringify(nProps.user))
  }

  render() {


    return (

      <div className='ui'>
        <Grid>
          <Grid.Row centered>
            <h3>Enter your University of Helsinki username and password.</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>

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
                  //onChange={handleFieldChange}
                  required />
              </Form.Group>

              <Form.Group inline>
                <label>Password</label>
                <Input
                  type='password'
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
const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}


export default connect(mapStateToProps, { login })(LoginPage)
