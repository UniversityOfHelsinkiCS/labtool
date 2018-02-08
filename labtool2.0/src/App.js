import React, { Component } from 'react'
import './App.css'
import Login from './components/pages/LoginPage'
import MainPage from './components/pages/MainPage'
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
    let backend = process.env.BACKEND_LOGIN_URL || 'localhost:3001/'

    axios.post('http://'+backend+'/login', {
      username: this.state.username,
      password: this.state.password
    })
      .then(response => {
        if (!response.data.error) {
          this.setState({ loggedIn: true })
          console.log('You have succesfully logged in')
          this.setState({ error: '' })
          console.log('login info reset')
          this.setState({
            username: '',
            password: ''
          })

        } else {
          this.setState({ error: 'Wrong username or password' })
          console.log('Wrong username or password')

        }

      })
      .catch(error => {
        this.setState({
          username: '',
          password: ''
        })
      })

  }

  render() {
    const u = this.state.username
    const p = this.state.password
    let page = this.state.loggedIn ?
      <MainPage logout={this.changeUserState} /> :

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