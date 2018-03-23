import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import Courses from './components/pages/Courses'
import { connect } from 'react-redux'
import { tokenLogin } from './reducers/loginReducer'
import { courseInstanceInitialization } from './reducers/courseInstanceReducer'
import { Container } from 'semantic-ui-react'

import Notification from './components/pages/Notification'
import RegisterPage from './components/pages/RegisterPage';
import Login from './Login'
import CoursePage from './components/pages/CoursePage'
import Email from './components/pages/Email.js'
import LoginPage from './components/pages/LoginPage.js'
import RegisterPage from './components/pages/RegisterPage.js'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'
import ReviewStudent from './components/pages/ReviewStudent'
import BrowseReviews from './components/pages/BrowseReviews'
import MyPageStudent from './components/pages/MyPageStudent'
import MyPageTeacher from './components/pages/MyPageTeacher'
import { Menu, Button } from 'semantic-ui-react'

class App extends React {
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
        <Main />
      </Container>
    )
  }
}

const Nav = () => {
  return (
    <main>

      <Menu
        stackable
        inverted
        borderless
        animation='overlay'
        style={{
          marginBottom: 25,
          backgroundColor: '#e9af43',
        }}>

        <Menu.Menu position='left'>

          <Menu.Item header>
            Labtool 2.0
          </Menu.Item>

          <Menu.Item link>
            <Link to="/mypagestudent">My page</Link>
          </Menu.Item>

          <Menu.Item link>
            <Link to="/courses">Courses</Link>
          </Menu.Item>




        </Menu.Menu>


        <Menu.Menu position='right'>

          <Menu.Item text>
            <em>*Matti-Kalevi Meikäläinen-Teikäläinen* logged in</em>
          </Menu.Item>

          <Menu.Item link>
            <Button color='white' >
              <Link to="/loginpage" color='white'>Logout</Link>
            </Button>
          </Menu.Item>

        </Menu.Menu>

      </Menu>

    </main>
  )
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
        <Route path={`${process.env.PUBLIC_URL}/loginPage`} component={LoginPage} />
        <Route path={`${process.env.PUBLIC_URL}/reviewstudent`} component={ReviewStudent} />
        <Route path={`${process.env.PUBLIC_URL}/ModifyCourseInstancePage`} component={ModifyCourseInstancePage} />
        <Route path={`${process.env.PUBLIC_URL}/myPageStudent`} component={MyPageStudent} />
        <Route path={`${process.env.PUBLIC_URL}/myPageTeacher`} component={MyPageTeacher} />


        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default withRouter(connect(
  null,
  { courseInstanceInitialization, tokenLogin }
)(App))
