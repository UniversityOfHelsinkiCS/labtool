import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'


const App = () => {
  return (
    <div>
      {/* <Header /> */}
      <Main />
    </div>
  )
}

const Main = () => {
  return (
    <main>
      <Switch>
        <Route exact path='/' component={Login} />
        <Route path='/courses' component={Courses} />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App