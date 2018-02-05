import React, { Component } from 'react';
import './App.css';
import Login from './Login';
import Etusivu from './Etusivu'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { loggedIn: false};
    this.changeUserState = this.changeUserState.bind(this);
  }
  changeUserState() {
    this.setState({loggedIn: !this.state.loggedIn});
  }

  render() {
    let page = this.state.loggedIn ?
    <Etusivu logout={this.changeUserState} />:
    <Login login={this.changeUserState} />;

    return (
      <div className="App" >
        {page}
      </div>
    );
  }
}

export default App;
