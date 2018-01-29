import React from 'react';

class Login extends React.Component {
  render() {
    return (
      <div className="App">
        <p>Kirjautumissivu</p>
        <form>
          <label>
            Käyttäjätunnus: <br />
            <input type="text" class="form-control" name="name" />
          </label>
          <label> <br />
            Salasana: <br />
            <input type="password" class="form-control" name="password" />
          </label> <br />
          <button onClick={this.props.login} >
          Kirjaudu
          </button>
        </form>
      </div>
    );
  }
}

export default Login;
