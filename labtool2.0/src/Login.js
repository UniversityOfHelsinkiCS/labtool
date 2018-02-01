import React from 'react';

const Login = ({ postLogin, handlePasswordChange, handleUsernameChange }) => {
    
    return(
      <div className="Login">
        <p>Kirjautumissivu</p>
        
        <form onSubmit={postLogin}>
          <label>
            Käyttäjätunnus: <br />
            <input type="text" className="form-control" name="name" onChange={handleUsernameChange} />
          </label>
          <label> <br />
            Salasana: <br />
            <input type="password" className="form-control" name="password" onChange={handlePasswordChange} />
          </label> <br />
          <button type="submit">Kirjaudu</button>
        </form>
      </div>
    );
  }


export default Login;