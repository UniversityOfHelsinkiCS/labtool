import React, { Component } from 'react'
import './App.css'
import Login from './components/pages/LoginPage'
import MainPage from './components/pages/MainPage'
import axios from 'axios'
import SetEmail from './components/pages/SetEmail'
import { BrowserRouter as Router } from 'react-router-dom'
import courseInstanceStudentService from './services/courseInstanceStudent'
import RegisterPage from './components/pages/RegisterPage'

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
      token: null,
      courseInstanceId: null,
      github: '',
      projectname: ''
    }
  }

  componentWillMount() {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user: user.returnedUser, token: user.token })
      courseInstanceStudentService.setToken(user.token)
    }
  }
  
  handleFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleFirstLoginFalse = (event) => {
    this.setState({ firstLogin: false })
  }

  handleFirstLoginTrue = (event) => {
    this.setState({ 
      firstLogin: true,
      email: this.state.user.email
    })
  }

  postLogout = (event) => {
    window.localStorage.removeItem('loggedUser')
    this.setState({ 
      user: null,
      token: null
    })
    courseInstanceStudentService.setToken('')
  }

  postCourseinstanceRegisteration = (event) => {
    event.preventDefault()

    courseInstanceStudentService.create({
      courseInstanceId: this.state.courseInstanceId,
      github: this.github,
      projectname: this.state.projectname
    })
  }

  updateUserinformationInLocalStorage = (user) => {
    console.log(user)
    const updatedUser = {
      user: user,
      token: this.state.token
    }
    window.localStorage.setItem('loggedUser', JSON.stringify(updatedUser))   
  }

  postEmail = (event) => {
    event.preventDefault()
    let backend
      /* This quick hax can be made more sane by introducing a ENV variable that
      * specifies the backend host uri such as:
      *
      *      BACKEND_URI=http://my.host.name/backend
      *  or
      *      BACKEND_URI=http://localhost:3001
      *
      *  And this could be used across the frontend by using the BACKEND_URI + '/path/to/wherever'
      *
      * */
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
          user: userWithEmail // Cannot get the backend to return user with updated email, should be found in response.data
        })
        this.updateUserinformationInLocalStorage(userWithEmail) //See the comment above
        
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
          console.log('You have succesfully logged in')
          this.setState({ error: '' })
          console.log('login info reset')
          console.log(response.data.token)
          this.setState({
            username: '',
            password: '',
            token: response.data.token,
            user: response.data.returnedUser
          })
          courseInstanceStudentService.setToken(response.data.token)
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
      <SetEmail postEmail={this.postEmail} handleFieldChange={this.handleFieldChange} handleFirstLoginFalse={this.handleFirstLoginFalse} email={this.state.email} /> :
      page = this.state.user ?
        <MainPage logout={this.postLogout} handleFirstLoginTrue={this.handleFirstLoginTrue} /> :

        <Login
          username={u}
          password={p}
          postLogin={this.postLogin}
          handleFieldChange={this.handleFieldChange}
        />

    return (
      <div className="App" >
        
        {page}
        <Notification message={this.state.error} />
        <RegisterPage onSubmit={this.postCourseinstanceRegisteration} handleFieldChange={this.handleFieldChange} github={this.state.github} projectname={this.state.projectname} />
        
      </div>
    )
  }
}

/*
      <div>
        <Router>
          <div>
            <div>
              <Link to="/">home</Link> &nbsp;
              <Link to="/course">courses</Link>
            </div>
            <Route exact path="/" render={() => <Home />} />
            <Route path="/coursese" render={() => <Notes />} />
          </div>
        </Router>
      </div>
      */

export default App