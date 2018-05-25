import React, { Component } from 'react'
import { Form, Grid, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { updateUser } from '../../services/login'
import { connect } from 'react-redux'
import { Redirect } from 'react-router'

/*
take some elements from SetEmail.js, if user has already email in db
text should be "Edit your email address" if email can be found from db

Is used to modify users email.
*/

class Email extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      redirectToNewPage: false
    }
  }

  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      email: e.target.email.value
    }
    this.setState({
      loading: true
    })
    await this.props.updateUser(content)
  }

  componentWillUpdate() {
    // This is a dirty hack relying on the component being updated an extra time when the email actually changes.
    if (this.state.loading) {
      this.setState({
        redirectToNewPage: true
      })
    }
  }

  render() {
    if (this.state.redirectToNewPage) {
      return <Redirect to="/labtool/myPage" />
    } else {
      const user = { ...this.props.user.user }
      const firstLogin = user.email === ''
      return (
        <div className="Email" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <Grid centered>
            {firstLogin ? (
              <div>
                <Grid.Row>
                  <h3>Please give your email address: </h3>
                </Grid.Row>
                <Grid.Row>
                  <p>Email is required because ...</p>
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
    user: state.user
  }
}

export default connect(mapStateToProps, { updateUser })(Email)
