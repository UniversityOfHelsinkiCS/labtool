import { connect } from 'react-redux'
import { login } from '../../services/login'
import React from 'react'
import { Form, Input, Button, Grid, Loader } from 'semantic-ui-react'

/**
 *  The page used to login
 */

export class LoginPage extends React.Component {
  state = {
    loading: false
  }

  handleSubmit = async e => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    console.log('Setting state.loading to true')
    this.setState({ loading: true })
    setTimeout(() => {
      console.log('Setting state.loading to false')
      this.setState({ loading: false })
    }, 1000)
    console.log('Has set state.loading to false')
    await this.props.login(content)
    console.log('Function handleSubmit has reached its end')
  }

  render() {
    return (
      <div className="LoginPage">
        <Loader active={this.state.loading} inline="centered" />

        <Grid>
          <Grid.Row centered>
            <h3>Enter your University of Helsinki username and password</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={this.handleSubmit}>
              <Form.Group inline>
                <label style={{ width: '75px' }}>Username</label>
                <Input type="text" name="username" icon="user" required="true" iconPosition="left" style={{ minWidth: '25em' }} placeholder="Your AD-username" className="form-control1" />
              </Form.Group>

              <Form.Group inline>
                <label style={{ width: '75px' }}>Password</label>
                <Input type="password" name="password" required="true" icon="lock" iconPosition="left" style={{ minWidth: '25em' }} placeholder="Your password" className="form-control2" />
              </Form.Group>

              <Form.Group>
                <Button type="submit" color="blue">
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
