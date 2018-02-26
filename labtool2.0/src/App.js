import React, { Component } from 'react'
import './App.css'
import Login from './components/pages/LoginPage'
import MainPage from './components/pages/MainPage'
import axios from 'axios'
import SetEmail from './components/pages/SetEmail'
import { Redirect, BrowserRouter as Router, Route, Link } from 'react-router-dom'
import studentinstancesService from './services/studentinstances'
import courseInstancesService from './services/courseInstance'
import RegisterPage from './components/pages/RegisterPage'
import ReactDOM from 'react-dom'
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
        return 'succ'
      })
      .catch(error => {
        this.setState(error) 
        return 'error'
      })
  }

  postLogin = () => {
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
          studentinstancesService.setToken(response.data.token)
          window.localStorage.setItem('loggedUser', JSON.stringify(response.data))

          if (response.data.created) {
            this.setState({ firstLogin: true })
            return 'create'
          }
          return 'succ'
        } else {
          this.setState({ error: 'Wrong username or password' })
          console.log('Wrong username or password')
          return 'error'
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


          <Login
            username={u}
            password={p}
            postLogin={this.postLogin}
            handleFieldChange={this.handleFieldChange}
          />

    const courseById = (id) =>
      this.state.courseInstances.find(course => course.id === Number(id))

    return (
      <div className="App" >
        <Router>
          <div>
            <div>
              <Link to="/">home</Link> &nbsp;
              <Link to="/courses">courses</Link> &nbsp;
              <Link to="/courses/create">create</Link> &nbsp;
              {this.state.user
                ? <em>{this.state.user.firsts} logged in</em>
                : <Link to="/login">login</Link>
              }
              {this.state.user ?
                <Link to="/settings">settings</Link> :
                <p></p>
              }
            </div>
            <Route exact path="/" render={() => <MainPage logout={this.postLogout} handleFirstLoginTrue={this.handleFirstLoginTrue} />} />
            <Route exact path="/courses" render={() => listingPage } />
            <Route exact path="/courses/:id" render={({ match }) => 
              <RegisterPage course={courseById(match.params.id)} onSubmit={this.postCourseinstanceRegisteration} handleFieldChange={this.handleFieldChange} github={this.state.github} projectname={this.state.projectname} 
              />}            
            />
            <Route exact path="/settings" render={({ history }) => 
              <SetEmail history={history} postEmail={this.postEmail} handleFieldChange={this.handleFieldChange} handleFirstLoginFalse={this.handleFirstLoginFalse} email={this.state.email} />} 
            />
            <Route path="/login" render={({ history }) =>
              <Login history={history} username={this.state.username} password={this.state.password} postLogin={this.postLogin} handleFieldChange={this.handleFieldChange}
              />}
            />

          </div>



        </Router>

      </div>
    )
      //        {page}
      // < Notification message = { this.state.error } />
  }
}
export default App