import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import dotenv from 'dotenv'


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
        <Route exact path={`${process.env.PUBLIC_URL}/`} component={Login} />
        <Route path={`${process.env.PUBLIC_URL}/courses`}  component={Courses} />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App