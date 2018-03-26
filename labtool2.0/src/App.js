import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import Courses from './components/pages/Courses'
import { connect } from 'react-redux'
import { tokenLogin } from './reducers/loginReducer'
import { logout } from './reducers/loginReducer'
import { courseInstanceInitialization } from './reducers/courseInstanceReducer'
import { Container } from 'semantic-ui-react'
import Nav from './components/pages/Nav'
import Notification from './components/pages/Notification'
import RegisterPage from './components/pages/RegisterPage';
import CoursePage from './components/pages/CoursePage'
import Login from './Login.js'
import Email from './components/pages/Email.js'
import LoginPage from './components/pages/LoginPage.js'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'
import ReviewStudent from './components/pages/ReviewStudent'
import BrowseReviews from './components/pages/BrowseReviews'
import MyPage from './components/pages/MyPage'

class App extends Component {
  componentDidMount() {
    this.props.courseInstanceInitialization()
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON)
        this.props.tokenLogin(user)
      }
    } catch (exception) {
      console.log('no user logged in')
    }
  }

  render() {
    return (
      <Container>
        <Nav />
        <Notification />
        {this.props.user
          ? <Main />
          : <LoginPage />
        }
      </Container>
    )
  }
}

const Main = () => {
  return (
    <main>
      <Switch>
        <Route exact path='/labtool/courses' render={({ history }) =>
          <Courses history={history} />}
        />
        <Route exact path='/labtool' render={({ history }) =>
          <LoginPage history={history} />}
        />
        <Route path="/labtool/courses/:id" render={({ match, history }) =>
          <RegisterPage history={history} courseinstance={(this.props.getCourseInstance(match.params.id))} />}
        />
        <Route exact path={`${process.env.PUBLIC_URL}/`} component={Login} />
        <Route path={`${process.env.PUBLIC_URL}/courses`} component={Courses} />
        <Route path={`${process.env.PUBLIC_URL}/browsereviews`} component={BrowseReviews} />
        <Route path={`${process.env.PUBLIC_URL}/coursePage`} component={CoursePage} />
        <Route path={`${process.env.PUBLIC_URL}/email`} component={Email} />
        <Route path={`${process.env.PUBLIC_URL}/loginPage`} component={LoginPage} />
        <Route path={`${process.env.PUBLIC_URL}/registerPage`} component={RegisterPage} />
        <Route path={`${process.env.PUBLIC_URL}/reviewstudent`} component={ReviewStudent} />
        <Route path={`${process.env.PUBLIC_URL}/ModifyCourseInstancePage`} component={ModifyCourseInstancePage} />
        <Route path={`${process.env.PUBLIC_URL}/myPage`} component={MyPage} />


        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}



const mapStateToProps = (state) => {
  return {
    user: state.user.returnedUser
  }
}



export default withRouter(connect(
  mapStateToProps,
  { courseInstanceInitialization, tokenLogin, logout }
)(App))
