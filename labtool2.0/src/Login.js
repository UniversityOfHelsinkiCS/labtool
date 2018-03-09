import React, { Component } from 'react'
import LoginPage from './components/pages/LoginPage'
import MainPage from './components/pages/MainPage'
import axios from 'axios'
import SetEmail from './components/pages/SetEmail'

import studentinstancesService from './services/studentinstances'
import courseInstancesService from './services/courseInstance'
import RegisterPage from './components/pages/RegisterPage'

import CourseInstance from './components/pages/CourseInstance'

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

class Login extends Component {

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
      projectname: '',
      courseInstances: []
    }
  }

  componentWillMount() {
    courseInstancesService.getAll().then(instances =>
      this.setState({ courseInstances: instances }))

    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      this.setState({ user: user.returnedUser, token: user.token })
      studentinstancesService.setToken(user.token)
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
    studentinstancesService.setToken('')
  }

  postCourseinstanceRegisteration = (event) => {
    event.preventDefault()

    studentinstancesService.create({
      courseInstanceId: this.state.courseInstanceId,
      github: this.state.github,
      projectName: this.state.projectname
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

    /*
    *  Like this. Now all you have to do is to set the url for the backend like if its located
    *  in the server example.com with https in the path of /my/backend then you would tell
    *  REACT_APP_BACKEND_URL=http://example.com/my/backend or in development just
    *  REACT_APP_BACKEND_URL=http://localhost:3001
    *
    * */
    backend = process.env.REACT_APP_BACKEND_URL + '/api/users/update'

    const userWithEmail = { ...this.state.user, email: this.state.email }
    console.log(userWithEmail)
    const config = { headers: { 'Authorization': 'bearer ' + this.state.token } }
    axios.put(backend, userWithEmail, config)
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
    backend = process.env.REACT_APP_BACKEND_URL + '/login'
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
          studentinstancesService.setToken(response.data.token)
          window.localStorage.setItem('loggedUser', JSON.stringify(response.data))

          if (response.data.created) {
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

    const listingPage = (
      <div>
        <MainPage logout={this.postLogout} handleFirstLoginTrue={this.handleFirstLoginTrue}/>
        <p></p>
        <p></p>
        {this.state.courseInstances.map(instance =>
          <CourseInstance
            handleFieldChange={this.handleFieldChange}
            key={instance.id}
            instance={instance}
          />
        )}
      </div>
    )

    const u = this.state.username
    const p = this.state.password
    let page = null
    page = this.state.courseInstanceId ?
      <RegisterPage onSubmit={this.postCourseinstanceRegisteration} handleFieldChange={this.handleFieldChange} github={this.state.github} projectname={this.state.projectname} /> :
      page = this.state.firstLogin ?
        <SetEmail postEmail={this.postEmail} handleFieldChange={this.handleFieldChange} handleFirstLoginFalse={this.handleFirstLoginFalse} email={this.state.email} /> :
        page = this.state.user ?
          listingPage :


          <LoginPage
            username={u}
            password={p}
            postLogin={this.postLogin}
            handleFieldChange={this.handleFieldChange}
          />

    return (
      <div className="App" >
        {page}
        <Notification message={this.state.error} />

      </div>
    )
  }
}
export default Login