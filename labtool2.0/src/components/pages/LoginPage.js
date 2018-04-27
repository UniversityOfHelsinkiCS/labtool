import { connect } from 'react-redux'
import { login } from '../../services/login'
import React from 'react'
import { Form, Input, Button, Grid, Loader } from 'semantic-ui-react'

class LoginPage extends React.Component {

  state = {
    loading: false
  }
 

  handleSubmit = async (e) => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    this.setState({ loading: true })
    await this.props.login(content)
  }


  render() {
    return (

      <div className='LoginPage'>
        <Loader active={this.state.loading} inline='centered' />
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
const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    renderAfter: ownProps.renderAfter
  }
}


export default connect(mapStateToProps, { login })(LoginPage)
