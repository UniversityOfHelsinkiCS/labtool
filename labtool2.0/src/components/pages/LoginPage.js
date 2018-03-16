import React from 'react'
import { login } from '../../reducers/userReducer'
import { connect } from 'react-redux'
class LoginPage extends React.Component {

  handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const content = {
        username: e.target.username.value,
        password: e.target.password.value
      }
      this.props.login(content)
      this.props.notificationSet(`Tervetuloa ${content.username}`)
    } catch (e) {

    }
    e.target.password.value = ''
  }
  render() {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit}>
          <div><input name='username' /></div>
          <div><input type='password' name='password' /></div>
          <button>create</button>
        </form>
      </div>
    )
  }
}


export default connect(null, { login })(LoginPage)