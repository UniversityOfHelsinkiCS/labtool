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
    <div class="error" className="error" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
      {message}
    </div>
  )
}

const Successful = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div class="success" className="success" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
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
      error: null,
      success: null,
      user: null,
      token: null,
      courseInstanceId: null,
      courseInstanceName: null,
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

  cancelRegister = () => {
    this.setState({ courseInstanceId: null })
  }

  handleFieldChange = (event) => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleRegister = (event) => {
    this.setState({
      courseInstanceId: event.target.value,
      courseInstanceName: event.target.name
    })
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
      token: null,
      success: 'You have logged out'
    })
    setTimeout(() => {
      this.setState({ success: null })
    }, 5000)
    studentinstancesService.setToken('')
  }

  postCourseinstanceRegisteration = (event) => {
    event.preventDefault()

    studentinstancesService.create({
      courseInstanceId: this.state.courseInstanceId,
      github: this.state.github,
      projectName: this.state.projectname
    })
    this.setState({
      success: 'Register successful!',
      courseInstanceId: null
    })
    setTimeout(() => {
      this.setState({ success: null })
    }, 5000)
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
    if (process.env.NODE_ENV === 'development') {
      backend = 'http://localhost:3001/api/users/update'
    } else {
      backend = '/labtool-backend/users/update'
    }
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
          user: userWithEmail, // Cannot get the backend to return user with updated email, should be found in response.data
          success: 'Email updated'
        })
        setTimeout(() => {
          this.setState({success: null})
        }, 3000)
        this.updateUserinformationInLocalStorage(userWithEmail) //See the comment above

        console.log('state has been cleared and user state refreshed')
      })
      .catch(error => this.setState(error))
  }

  postLogin = (event) => {
    event.preventDefault()
    let backend
    if (process.env.NODE_ENV === 'development') {
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
          this.setState({ error: null, success: 'You have successfully logged in' })
          setTimeout(() => {
            this.setState({ success: null })
          }, 5000)
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
          console.log('Wrong username or password')
        }

      })
      .catch(error => {
        this.setState({
          username: '',
          password: '',
          error: 'Wrong username or password'
        })
        setTimeout(() => {
          this.setState({error: null})
        }, 5000)
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
            handleFieldChange={this.handleRegister}
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
      <RegisterPage name={this.state.courseInstanceName} cancel={this.cancelRegister} onSubmit={this.postCourseinstanceRegisteration} handleFieldChange={this.handleFieldChange} github={this.state.github} projectname={this.state.projectname} /> :
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
        <p></p>
        <Notification message={this.state.error} />
        <p></p>
        <Successful message={this.state.success} />
      </div>
    )
  }
}
export default Login