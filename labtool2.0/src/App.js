// Package related imports
import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'

// Component (pages) imports
import Courses from './components/pages/Courses'
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

// Reducer imports
import { logout } from './reducers/loginReducer'
import { tokenLogin } from './reducers/loginReducer'

// The main component of the whole application.
class App extends Component {
  /**
   * After mounting, it checks from the localstorage if user is logged in.
   * If true, it parses the user from the storage and puts it and
   * the courses of the user, both student and teacher, to the store.
   */

  componentDidMount() {
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
        this.props.tokenLogin(user)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  /**
   * @param {*} nProps nProps are the props the component will receive next,
   * in this case after succesfull login.
   *
   * It puts the users data the storage
   */
  componentWillReceiveProps(nProps) {
    const userAndToken = {
      user: nProps.user,
      token: nProps.token,
      created: nProps.created
    }
    window.localStorage.setItem('loggedLabtool', JSON.stringify(userAndToken))
  }

  render() {
    /**
     *  The main component that shows the applications pages.
     * If the user isnt logged in or the user has not set an email, main
     * wont be shown.
     */

    const Main = () => {
      return (
        <main>
          <Switch>
            <Route path={`/labtool/courses/:id`} render={({ match, history }) => <CoursePage history={history} courseId={match.params.id} />} />
            <Route exact path={`/labtool/courses`} render={({ history }) => <Courses history={history} />} />
            <Route path={`/labtool/courseregistration/:id`} render={({ match, history }) => <RegisterPage history={history} courseId={match.params.id} />} />
            <Route path={`/labtool/browsereviews/:id/:si/`} render={({ match, history }) => <BrowseReviews history={history} courseId={match.params.id} studentInstance={match.params.si} />} />
            <Route path={`/labtool/email`} component={Email} />
            <Route path={`/labtool/registerPage`} component={RegisterPage} />
            <Route
              path={`/labtool/reviewstudent/:id/:si/:wk`}
              render={({ match, history }) => <ReviewStudent history={history} courseId={match.params.id} studentInstance={match.params.si} weekNumber={match.params.wk} />}
            />
            <Route path={`/labtool/ModifyCourseInstancePage/:id`} render={({ match }) => <ModifyCourseInstancePage courseId={match.params.id} />} />
            <Route path={`/`} render={() => <MyPage />} />
          </Switch>
        </main>
      )
    }

    /**
     * a component that forces the user to put an email.
     * Checks the email from redux store.
     */
    const EmailChecker = () => <div>{this.props.user.email === '' || this.props.user.email === null ? <Email /> : <Main />}</div>

    return (
      /**
       * LoginPage is shown if store doesnt have a user,
       * as in user isnt logged in.
       *
       * Nav is the component for the navbar, that is always displayed.
       */
      <Container>
        <Nav />
        <Notification />
        {this.props.user ? EmailChecker() : <LoginPage />}
      </Container>
    )
  }
}

/**
 * The reducers that this component uses.
 */
const mapStateToProps = state => {
  return {
    user: state.user.user,
    token: state.user.token,
    created: state.user.created
  }
}

export default withRouter(connect(mapStateToProps, { tokenLogin, logout })(App))
