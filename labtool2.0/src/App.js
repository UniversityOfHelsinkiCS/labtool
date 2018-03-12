import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import { connect } from 'react-redux'
import { courseInstanceInitialization } from './reducers/courseInstanceReducer'


class App extends React.Component {

  componentDidMount() {

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
        <Route path='/labtool/courses' component={Courses} />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App