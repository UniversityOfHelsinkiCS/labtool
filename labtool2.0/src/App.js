import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
      <p>Kirjautumissivu</p>

      <form>
        <div>
        <label>
          Käyttäjätunnus:
        <input type="text" name="name" />
        </label>
        </div>
        <div>
          <label>
            Salasana:
            <input type="password" name="password"/>  
          </label>
        </div>
        <input type="submit" value="Submit" />

      </form>
      </div>
    );
  }
}

export default App;
