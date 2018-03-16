<<<<<<< HEAD
import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
=======
import React from 'react'
import { Switch, Route } from 'react-router-dom'
>>>>>>> 13754bfdacd180e248e955929b2b590090708be2
import Courses from './components/pages/Courses'
import Login from './Login'
import { connect } from 'react-redux'
import { courseInstanceInitialization } from './reducers/courseInstanceReducer'
import LoginPage from './components/pages/LoginPage';
import { Container } from 'semantic-ui-react'
class App extends React.Component {

  componentDidMount() {
    this.props.courseInstanceInitialization()
  }

  render() {

    return (
      <Container>
        <div>
          {/* <Header /> */}
          <Main />
        </div>
      </Container>
    )
  }
}

const Main = () => {
  return (
    <main>
      <Switch>
        <Route exact path='/labtool' component={Login} />
        <Route path='/labtool/courses' render={({ history }) =>
          <Courses history={history} />} 
        />
        <Route exact path='/labtool' render={({ history }) =>
          <LoginPage history={history} />}
        />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default withRouter(connect(
  null,
  { courseInstanceInitialization }
)(App))
