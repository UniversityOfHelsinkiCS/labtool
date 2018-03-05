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

const Successful = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="success">
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
      success:'',
      user: null,
      token: null
    }
  }

  componentWillMount() {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user: user.returnedUser, token: user.token })
    }
  } 

  handleFirstLoginFalse = (event) => {
    this.setState({ firstLogin: false })
  }

  handleFirstLoginTrue = (event) => {
    this.setState({ 
      firstLogin: true,
      email: this.state.user.email,
      error: null,
      success: null
    })
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
      token: null,
      success: 'You have logged out'
    })
    setTimeout(() => {
      this.setState({ success: null })
    }, 5000)
  }

  postEmail = (event) => {
    event.preventDefault()
    let backend
    if (process.env.NODE_ENV === "development") {
      backend = 'http://localhost:3001/api/users/update'
    } else {
      backend = '/labtool-backend/users/update'
    }
    const userWithEmail = {...this.state.user, email: this.state.email}
    console.log(userWithEmail)
    const config = {headers: { 'Authorization': 'bearer ' + this.state.token }}
    axios.put(backend, userWithEmail, config )
      .then(response => {
        console.log(config)
        console.log('You have updated email')
        this.setState({ 
          email: '',
          firstLogin: false,
          user: response.data,
          success: 'Email updated'
        })
        setTimeout(() => {
          this.setState({success: null})
        }, 3000)
        console.log('state has been cleared and user state refreshed')
      })
      .catch(error => this.setState(error))
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
          console.log('You have successfully logged in')
          this.setState({ error: '', success: 'You have successfully logged in' })
          console.log('login info reset')
          console.log(response.data.token)
          this.setState({
            username: '',
            password: '',
            token: response.data.token,
            user: response.data.returnedUser
          })
          setTimeout(() => {
            this.setState({ success: null })
          }, 5000)
          window.localStorage.setItem('loggedUser', JSON.stringify(response.data))

          if(response.data.created) {
            this.setState({ firstLogin: true })
          }
        } else {
          this.setState({ error: 'Wrong username or password' })
          console.log('Wrong username or password')

        }

      })
      .catch(error => {
        this.setState({
          error: 'Wrong username or password'
        })
        setTimeout(() => {
          this.setState({error: null})
        }, 5000)
        console.log('Wrong username or password')
      })

  }

  render() {
    const u = this.state.username
    const p = this.state.password
    let page  = null
    page = this.state.firstLogin ? 
      <SetEmail postEmail={this.postEmail} handleEmailChange={this.handleEmailChange} handleFirstLoginFalse={this.handleFirstLoginFalse} email={this.state.email} /> :
      page = this.state.user ?
        <MainPage logout={this.postLogout} handleFirstLoginTrue={this.handleFirstLoginTrue} /> :

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
        <Successful message={this.state.success} />
      </div>
    )
  }
}

export default App
