import React, { Component } from 'react'
import { Form, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { updateUser } from '../../services/login'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'
import { resetEmailPage } from '../../reducers/emailReducer'

/*
take some elements from SetEmail.js, if user has already email in db
text should be "Edit your email address" if email can be found from db

Is used to modify users email.
*/

export class Email extends Component {
  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      email: e.target.email.value
    }
    await this.props.updateUser(content)
  }

  componentWillUnmount() {
    this.props.resetEmailPage()
  }

  render() {
    if (this.props.emailPage.redirect) {
      return <Redirect to="/labtool/myPage" />
    } else {
      const user = { ...this.props.user.user }
      const firstLogin = user.email === ''
      return (
        <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <Loader active={this.props.emailPage.loading} inline="centered" />
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
              <Form onSubmit={this.handleSubmit}>
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
}

const mapStateToProps = state => {
  return {
    user: state.user,
    emailPage: state.emailPage
  }
}

export default connect(mapStateToProps, { updateUser, resetEmailPage })(Email)
