import React, { useEffect } from 'react'
import { Form, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { updateUser } from '../../services/login'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { resetLoading, addRedirectHook, forceSetLoading } from '../../reducers/loadingReducer'

/*
take some elements from SetEmail.js, if user has already email in db
text should be "Edit your email address" if email can be found from db

Is used to modify users email.
*/

export const Email = props => {
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
      email: e.target.email.value
    }
    props.addRedirectHook({
      hook: 'USER_UPDATE_'
    })
    await props.updateUser(content)
  }

  if (props.loading.redirect) {
    return <Redirect to="/labtool/myPage" />
  } else {
    const user = { ...props.user.user }
    const firstLogin = user.email === ''
    return (
      <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <Loader active={props.loading.loading} inline="centered" />
        <Grid centered>
          {firstLogin ? (
            <div>
              <Grid.Row>
                <h3>Please give your email address: </h3>
              </Grid.Row>
            </div>
          ) : (
            <div>
              <Grid.Row>
                <h3>Edit your email address: </h3>
              </Grid.Row>
            </div>
          )}

          <Grid.Row>
            <Form onSubmit={handleSubmit}>
              <Form.Field>
                <Form.Input
                  defaultValue={user.email}
                  style={{ minWidth: '20em' }}
                  type="email"
                  icon="mail"
                  iconPosition="left"
                  className="form-control"
                  name="email"
                  placeholder="my.email@helsinki.fi"
                />
              </Form.Field>

              <Form.Field>
                <button className="ui left floated green button" type="submit">
                  Save
                </button>
                {firstLogin ? (
                  <div />
                ) : (
                  <Link to="/labtool/mypage">
                    <button className="ui right floated button">Cancel</button>
                  </Link>
                )}
              </Form.Field>
            </Form>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  updateUser,
  resetLoading,
  addRedirectHook,
  forceSetLoading
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Email)
