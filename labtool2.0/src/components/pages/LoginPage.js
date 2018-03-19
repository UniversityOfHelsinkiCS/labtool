import React from 'react'
import { connect } from 'react-redux'
import { newNotification } from '../../reducers/notificationReducer'
import { login } from '../../services/login'
class LoginPage extends React.Component {

  handleSubmit = async (e) => {
    e.preventDefault()

    const content = {
      username: e.target.username.value,
      password: e.target.password.value
    }
    const valid = this.props.login(content)
    this.props.newNotification({ message: 'Teretulemasta', error: false })



    /* this.props.newNotification({ message: 'VÄÄRÄ', error: true }) */


    e.target.username.value = ''

    this.props.history.push('/labtool/courses')
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


export default connect(null, { login, newNotification })(LoginPage)
