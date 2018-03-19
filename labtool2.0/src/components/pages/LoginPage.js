import React from 'react'

const Login = ({ postLogin, handleFieldChange, username, password }) => {

  return (
    <div className="Login" style={{ textAlignVertical: 'center', textAlign: 'center', }}>
      <p>Labtool 2.0</p>

      <form onSubmit={postLogin}>
        <label>
          Username: <br />
          <input type="text" className="form-control1" value={username} name="username" onChange={handleFieldChange} required />
        </label>
        <label> <br />
          Password: <br />
          <input type="password" className="form-control2" value={password} name="password" onChange={handleFieldChange} required />
        </label> <br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}


export default Login