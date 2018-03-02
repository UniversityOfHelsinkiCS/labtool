import React from 'react'

const Login = ({ postLogin, handleFieldChange, username, password }) => {

  return (
    <div className="Login">
      <p>Login page</p>

      <form onSubmit={postLogin}>
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