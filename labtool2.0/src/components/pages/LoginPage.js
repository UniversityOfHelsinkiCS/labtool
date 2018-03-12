import React from 'react'

class LoginPage extends React.Component {

  handleSubmit = async (e) => {
    e.preventDefault()
    const content = e.target.anecdote.value
    e.target.anecdote.value = ''
    this.props.anecdoteCreation(content)

  }
  render() {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit}>
          <div><input name='anecdote' /></div>
          <div><input name='password' /></div>
          <button>create</button>
        </form>
      </div>
    )
  }
}


export default Login