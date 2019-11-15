// Package related imports
import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import preval from 'preval.macro'

// Component (pages) imports
import Courses from './components/pages/Courses'
import Nav from './components/pages/Nav'
import Notification from './components/pages/Notification'
import RegisterPage from './components/pages/RegisterPage'
import CoursePage from './components/pages/CoursePage'
import MassEmailPage from './components/pages/MassEmailPage'
import Email from './components/pages/Email.js'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'
import ModifyCourseInstanceStaff from './components/pages/ModifyCourseInstanceStaff'
import ModifyCourseInstanceCodeReviews from './components/pages/ModifyCourseInstanceCodeReviews'
import ReviewStudent from './components/pages/ReviewStudent'
import ReviewStudentCodeReview from './components/pages/ReviewStudentCodeReview'
import BrowseReviews from './components/pages/BrowseReviews'
import MyPage from './components/pages/MyPage'
import CreateChecklist from './components/pages/CreateChecklist'
import ManageTags from './components/pages/ManageTags'
import FakeLoginPage from './components/pages/FakeLoginPage'
import CourseImport from './components/pages/CourseImport'
import AdminPage from './components/pages/AdminPage'

// Reducer imports
import { tokenLogin } from './reducers/loginReducer'
import { login, logout, fakeShibboLogin } from './services/login'
import { resetLoading, forceSetLoading } from './reducers/loadingReducer'
import { getIsAllowedToImport } from './services/courseImport'

import { clearAllPersistedStates } from './hooks/persistedState'

const USE_FAKE_LOGIN = process.env.REACT_APP_USE_FAKE_LOGIN === 'ThisIsNotProduction'
const SHOW_VERSION = process.env.REACT_APP_SHOW_VERSION

if (SHOW_VERSION) {
  console.log(`[Debug version] Built on: ` + preval`module.exports = new Date().toLocaleString()`)
  console.log(
    `[Debug version] Git commit: ` +
      preval`module.exports = (git => { try { return git.branch() + ':' + git.long() + ', ' + git.date().toLocaleString() + '\\n"' + git.message() + '"' } catch (e) { return '(no repository available)' } })(require('git-rev-sync'))`
  )
}
if (USE_FAKE_LOGIN) {
  console.log('USING FAKE LOGIN!!! DISABLE ON PRODUCTION!!!')
}

try {
  Raven.config('https://d12f1efa9d2a4d88a34584707472b08f@toska.cs.helsinki.fi/8').install() // eslint-disable-line
} catch (e) {} // eslint-disable-line

// The main component of the whole application.
const App = props => {
  useEffect(() => {
    /**
     * Automatically log in when landing on front page
     */
    props.resetLoading()
    props.forceSetLoading({
      value: false
    })
    if (USE_FAKE_LOGIN) {
      let obj
      try {
        obj = JSON.parse(window.localStorage.getItem('fake-shibbo-data'))
      } catch (e) {
        obj = {}
      }
      props.login(obj)
    } else {
      props.login()
    }

    /**
     * After mounting, it checks from the localstorage if user is logged in.
     * If true, it parses the user from the storage and puts it and
     * the courses of the user, both student and teacher, to the store.
     */
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
        props.tokenLogin(user)
      }
    } catch (exception) {
      console.error(exception)
    }
  }, [])

  /**
   * the props the component will receive next,
   * in this case after succesfull login.
   *
   * It puts the users data the storage
   */
  useEffect(() => {
    const userAndToken = {
      user: props.user,
      token: props.token,
      created: props.created
    }
    window.localStorage.setItem('loggedLabtool', JSON.stringify(userAndToken))
    props.getIsAllowedToImport()
  }, [props.user, props.token, props.created])

  /**
   *  The main component that shows the applications pages.
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
          <Route path={`/labtool/massemail/:id`} render={({ match, history }) => <MassEmailPage history={history} courseId={match.params.id} />} />
          <Route path={`/labtool/registerPage`} component={RegisterPage} />
          <Route
            path={`/labtool/reviewstudent/:id/:si/:wk`}
            render={({ match, history }) => <ReviewStudent history={history} courseId={match.params.id} studentInstance={match.params.si} weekNumber={match.params.wk} />}
          />
          <Route
            path={`/labtool/reviewstudentcr/:id/:si/:cr`}
            render={({ match, history }) => <ReviewStudentCodeReview history={history} courseId={match.params.id} studentInstance={match.params.si} codeReviewNumber={match.params.cr} />}
          />
          <Route path={`/labtool/ModifyCourseInstancePage/:id`} render={({ match }) => <ModifyCourseInstancePage courseId={match.params.id} />} />
          <Route path={`/labtool/ModifyCourseInstanceStaff/:id`} render={({ match }) => <ModifyCourseInstanceStaff courseId={match.params.id} />} />
          <Route path={'/labtool/ModifyCourseInstanceCodeReviews/:id'} render={({ match }) => <ModifyCourseInstanceCodeReviews courseId={match.params.id} />} />
          <Route path={'/labtool/checklist/:id/create'} render={({ match }) => <CreateChecklist courseId={match.params.id} />} />
          <Route path={'/labtool/ManageTags'} component={ManageTags} />
          <Route path={'/labtool/checklist/:id/create'} render={({ match }) => <CreateChecklist courseId={match.params.id} />} />
          <Route path={'/labtool/courseimport'} render={() => <CourseImport />} />
          <Route path={`/labtool/admin`} component={AdminPage} />
          <Route path={`/`} render={() => <MyPage />} />
        </Switch>
      </main>
    )
  }

  /**
   * a component that forces the user to put an email.
   * Checks the email from redux store.
   */
  const EmailChecker = () => (props.user.email === '' || props.user.email === null ? <Email /> : <Main />)

  /**
   * Logout code.
   */
  const doLogout = () => {
    clearAllPersistedStates()
    window.localStorage.removeItem('loggedLabtool')
    props.logout()
  }

  return (
    /**
     * Nav is the component for the navbar, that is always displayed.
     */
    <div className="mainContainer">
      <Nav logout={doLogout} />
      <Notification />
      {props.user ? EmailChecker() : USE_FAKE_LOGIN ? <FakeLoginPage /> : null}
    </div>
  )
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

App.propTypes = {
  user: PropTypes.object,
  token: PropTypes.string,
  created: PropTypes.bool,

  tokenLogin: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  forceSetLoading: PropTypes.func.isRequired,
  getIsAllowedToImport: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    mapStateToProps,
    {
      tokenLogin,
      logout,
      login: USE_FAKE_LOGIN ? fakeShibboLogin : login,
      resetLoading,
      forceSetLoading,
      getIsAllowedToImport
    }
  )(App)
)
