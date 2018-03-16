import React, { Component } from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import { connect } from 'react-redux'
import { courseInstanceInitialization } from './reducers/courseInstanceReducer'
import LoginPage from './components/pages/LoginPage';


class App extends React.Component {

  componentDidMount() {
    this.props.courseInstanceInitialization()
  }

  render() {

    return (
      <div>
        {/* <Header /> */}
        <Main />
      </div>
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
        <Route path='/labtool/test' render={({ history }) =>
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
