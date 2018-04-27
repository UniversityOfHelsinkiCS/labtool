import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import Courses from './components/pages/Courses'
import { connect } from 'react-redux'
import { tokenLogin } from './reducers/loginReducer'
import { logout } from './reducers/loginReducer'
import { getAllCI } from './services/courseInstance'
import { Container } from 'semantic-ui-react'
import Nav from './components/pages/Nav'
import Notification from './components/pages/Notification'
import RegisterPage from './components/pages/RegisterPage'
import CoursePage from './components/pages/CoursePage'
import Email from './components/pages/Email.js'
import LoginPage from './components/pages/LoginPage.js'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'
import ReviewStudent from './components/pages/ReviewStudent'
import BrowseReviews from './components/pages/BrowseReviews'
import MyPage from './components/pages/MyPage'
import { getOneCI } from './services/courseInstance'
import { coursePageInformation } from './services/courseInstance'


import { getAllStudentCourses } from './services/studentinstances'
import { getAllTeacherCourses } from './services/teacherinstances'

class App extends Component {
  componentWillMount() {
    this.props.getAllCI()
  }

  componentDidMount() {
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
        this.props.tokenLogin(user)
        this.props.getAllStudentCourses()
        this.props.getAllTeacherCourses()
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  componentWillReceiveProps(nProps) {
    // Kutsutaan kun kirjautuminen onnistuu -->
    const userAndToken = {
      user: nProps.user,
      token: nProps.token,
      created: nProps.created
    }
    window.localStorage.setItem('loggedLabtool', JSON.stringify(userAndToken))
  }




  render() {

    const Main = () => {
      return (
        <main>
          <Switch>
            <Route path={`/labtool/courses/:id`} render={({ match, history }) =>
              <CoursePage history={history} courseinstance={(this.props.getOneCI(match.params.id))}
                pageData={(this.props.coursePageInformation(match.params.id))}
              />}
            />
            <Route exact path={`/labtool/courses`} render={({ history }) =>
              <Courses history={history} />}
            />
            <Route path={`/labtool/courseregistration/:id`} render={({ match, history }) =>
              <RegisterPage history={history} courseinstance={(this.props.getOneCI(match.params.id))} />}
            />
            <Route path={`/labtool/browsereviews`} component={BrowseReviews} />
            <Route path={`/labtool/email`} component={Email} />
            <Route path={`/labtool/registerPage`} component={RegisterPage} />
            <Route path={`/labtool/reviewstudent/:id/:si/:wk`} render={({ match, history }) =>
              <ReviewStudent history={history} courseinstance={(this.props.getOneCI(match.params.id))} studentInstance={match.params.si} weekNumber={match.params.wk} />}
            />
            <Route path={`/labtool/ModifyCourseInstancePage/:id`} render={({ match }) =>
              <ModifyCourseInstancePage courseinstance={(this.props.getOneCI(match.params.id))} />}
            />
            <Route path={`/`} component={MyPage} />

            {/* <Route path='/schedule' component={Schedule} /> */}
          </Switch>
        </main>
      )

    }

    const EmailChecker = () => (
      <div>
        {this.props.user.email === "" || this.props.user.email === null
          ? <Email />
          : <Main />}
      </div>
    )

    return (
      <Container>
        <Nav />
        <Notification />
        {this.props.user
          ? EmailChecker()
          : <LoginPage />
        }
      </Container>
    )
  }
}



const mapStateToProps = (state) => {
  return {
    user: state.user.user,
    token: state.user.token,
    created: state.user.created,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance
  }
}



export default withRouter(connect(
  mapStateToProps,
  { getAllCI, tokenLogin, logout, getOneCI, coursePageInformation, getAllStudentCourses, getAllTeacherCourses }
)(App))
