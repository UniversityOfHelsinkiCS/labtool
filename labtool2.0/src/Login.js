import React from 'react';

const Login = ({ postLogin, handlePasswordChange, handleUsernameChange, username, password }) => {
  return (
    <div className="Login">
      <p>Kirjautumissivu</p>
      <form onSubmit={postLogin}>
        <label>
            Käyttäjätunnus: <br />
          <input value={username} type="text" className="form-control" name="name" onChange={handleUsernameChange} />
        </label>
        <label> <br />
            Salasana: <br />
          <input value={password} type="password" className="form-control" name="password" onChange={handlePasswordChange} />
        </label> <br />
        <button type="submit">Kirjaudu</button>
      </form>
    </div>
  );
};


export default Login;