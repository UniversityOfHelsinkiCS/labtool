import React from 'react'

const Login = ({ history, postLogin, handleFieldChange, username, password }) => {
  
  const onSubmit = async (event) => {
    event.preventDefault()
    const message = await postLogin()
    if (message === 'succ') {
      history.push('/')
    } else if (message === 'create') {
      history.push('/settings')
    }
  }

  return (
    <div className="Login">
      <p>Login page</p>

      <form onSubmit={onSubmit}>
        <label>
          Username: <br />
          <input type="text" className="form-control" value={username} name="username" onChange={handleFieldChange} required />
        </label>
        <label> <br />
          Password: <br />
          <input type="password" className="form-control" value={password} name="password" onChange={handleFieldChange} required />
        </label> <br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}


export default Login