import React from 'react';

const Login = ({ postLogin, handlePasswordChange, handleUsernameChange }) => {
    
    return(
      <div className="Login">
        <p>Login page</p>
        
        <form onSubmit={postLogin}>
          <label>
            Username: <br />
            <input type="text" className="form-control" name="name" onChange={handleUsernameChange} />
          </label>
          <label> <br />
            Password: <br />
            <input type="password" className="form-control" name="password" onChange={handlePasswordChange} />
          </label> <br />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }


export default Login;