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
import { getOneCI } from './reducers/courseInstanceReducer'


class Main extends Component {
  render() {
    return (
      <main>
        <Switch>
          <Route exact path={`${process.env.PUBLIC_URL}/courses`} render={({ history }) =>
            <Courses history={history} />}
          />
          <Route path={`${process.env.PUBLIC_URL}/courses/:id`} render={({ match, history }) =>
            <RegisterPage history={history} courseinstance={(this.props.getOneCI(match.params.id))} />}
          />
          <Route path={`${process.env.PUBLIC_URL}/browsereviews`} component={BrowseReviews} />
          <Route path={`${process.env.PUBLIC_URL}/coursePage`} component={CoursePage} />
          <Route path={`${process.env.PUBLIC_URL}/email`} component={Email} />
          <Route path={`${process.env.PUBLIC_URL}/registerPage`} component={RegisterPage} />
          <Route path={`${process.env.PUBLIC_URL}/reviewstudent`} component={ReviewStudent} />
          <Route path={`${process.env.PUBLIC_URL}/ModifyCourseInstancePage`} component={ModifyCourseInstancePage} />
          <Route path={`${process.env.PUBLIC_URL}/`} component={MyPage} />


          {/* <Route path='/schedule' component={Schedule} /> */}
        </Switch>
      </main>
    )
  }
}

export default connect(null, { getOneCI })(Main)