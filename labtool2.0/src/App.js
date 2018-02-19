import React, { Component } from 'react'
import './App.css'
import Login from './components/pages/LoginPage'
import MainPage from './components/pages/MainPage'
import axios from 'axios'
import SetEmail from './components/pages/SetEmail'

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
      username: '',
      password: '',
      email: '',
      firstLogin: false,
      error: '',
      user: null,
      token: null
    }
  }

  componentWillMount() {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user, token: user.token })
    }
  } 

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleUsernameChange = (event) => {
    this.setState({ username: event.target.value })
  }

  handleEmailChange = (event) => {
    this.setState({ email: event.target.value })
  }

  postLogout = (event) => {
    window.localStorage.removeItem('loggedUser')
    this.setState({ 
      user: null,
      token: null
    })
  }

  postEmail = (event) => {

  }

  postLogin = (event) => {
    event.preventDefault()
    let backend
    if (process.env.NODE_ENV === "development") {
      backend = 'http://localhost:3001/login'
    } else {
      backend = '/labtool-backend/login'
    }
    axios.post(backend, {
      username: this.state.username,
      password: this.state.password
    })
      .then(response => {
        if (!response.data.error) {
          console.log('You have succesfully logged in')
          this.setState({ error: '' })
          console.log('login info reset')
          console.log(response.data.token)
          this.setState({
            username: '',
            password: '',
            token: response.data.token,
            user: response.data
          })
          window.localStorage.setItem('loggedUser', JSON.stringify(response.data))

          if(response.data.created) {
            this.setState({ firstLogin: true })
            //Enter new email

            //Update new email to DB
          }
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
    let page  = null
    page = this.state.firstLogin ? 
      <SetEmail postEmail={this.postEmail} handleEmailChange={this.handleEmailChange} /> :
      page = this.state.user ?
        <MainPage logout={this.postLogout} /> :

        <Login
          username={u}
          password={p}
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