import React from 'react'
import { connect } from 'react-redux'
import { login } from '../../services/login'
class LoginPage extends React.Component {

  handleSubmit = async (e) => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    this.props.login(content)
    /* this.props.newNotification({ message: 'VÄÄRÄ', error: true }) */

    //this.props.history.goBack() //Will be changed
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
