import React, { Component } from 'react'
import './App.css'
import Login from './components/pages/LoginPage'
import Etusivu from './components/pages/MainPage'
import axios from 'axios'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="error">
      {message}
    </div>
  )
}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loggedIn: false,
      username: '',
      password: '',
      error: ''
    }

    this.changeUserState = this.changeUserState.bind(this)
  }

  changeUserState() {
    this.setState({ loggedIn: !this.state.loggedIn })
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value })
  }

  postLogin = (event) => {

    event.preventDefault()
    
    if (this.state.password !== "" && this.state.username !== "") {
      axios.post('https://opetushallinto.cs.helsinki.fi/login', {
        username: this.state.username,
        password: this.state.password
      })
        .then(response => {
          if (!response.data.error) {
            this.setState({ loggedIn: true })
            console.log('You have succesfully logged in')
            this.setState({ error: '' })

          } else {
            this.setState({ error: 'Wrong username or password' })
            console.log('Wrong username or password')

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
        })
    } else {
      this.setState({error: 'No username or password given'}) 
    }

  }

  render() {
    const u = this.state.username
    const p = this.state.password
    let page = this.state.loggedIn ?
      <Etusivu logout={this.changeUserState} /> :

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
        <Notification message={this.state.error} />
      </div>
    )
  }
}

export default App
