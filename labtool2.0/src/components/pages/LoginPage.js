import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { login } from '../../services/login'
import { resetLoading, forceSetLoading } from '../../reducers/loadingReducer'
import { Form, Input, Button, Grid, Loader } from 'semantic-ui-react'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'

/**
 *  The page used to login
 */

export const LoginPage = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.forceSetLoading({
      value: false
    })
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    await props.login(content)
  }

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  return (
    <>
      <DocumentTitle title="Login" />
      <div className="LoginPage">
        <Loader active={props.loading.loading} inline="centered" />

        <Grid>
          <Grid.Row centered>
            <h3>Enter your University of Helsinki username and password</h3>
          </Grid.Row>
        </Grid>

        <Grid>
          <Grid.Row centered>
            <Form onSubmit={handleSubmit}>
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
    </>
  )
}
const mapStateToProps = state => {
  return {
    user: state.user,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  login,
  resetLoading,
  forceSetLoading
}

LoginPage.propTypes = {
  user: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  login: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  forceSetLoading: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage)
