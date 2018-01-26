import React, { Component } from 'react';
import './App.css';

class Login extends Component {
  render() {
    return (
      <div className="App">
        <p>Kirjautumissivu</p>
        <form>
          <div>
            <label> Käyttäjätunnus:</label>
              <input type="text"  class="form-control" name="name" />
          </div>
          <div>
            <label> Salasana:</label>
            <input type="password" class="form-control" name="password" />
          </div>
          <input type="submit" value="Login"/>
        </form>
      </div>
    );
  }
}

export default Login;
