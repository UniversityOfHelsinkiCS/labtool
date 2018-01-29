import React, { Component } from 'react';
import './App.css';
import Login from './Login';
import Etusivu from './Etusivu'
import axios from 'axios'

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
        loggedIn: false,
        username: '',
        password: ''
      };

    this.changeUserState = this.changeUserState.bind(this);
  }
  
  changeUserState() {
    this.setState({loggedIn: !this.state.loggedIn});
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value })
  }

  postLogin = (event) => {
    event.preventDefault()
    axios.post('https://opetushallinto.cs.helsinki.fi/login', {
      username: this.state.username,
      password: this.state.password
    })
      .then(response => {
        if (!response.data.error) {
          this.setState({ loggedIn: true })          
        }
        this.setState({          
          username: '',
          password: ''  
        })
      })
      .catch(error => {
        this.setState({
          username: '',
          password: ''
        })
      });
  }

  render() {
    const u = this.state.username
    const p = this.state.password
    let page = this.state.loggedIn ?
    <Etusivu logout={this.changeUserState} />:
      <Login
        username={u}
        password={p}
        login={this.changeUserState}
        postLogin={this.postLogin}
        handlePasswordChange={this.handlePasswordChange}
        handleUsernameChange={this.handleUsernameChange}
      />

    return (
      <div className="App" >
        {page}
      </div>
    );
  }
}

export default App;
