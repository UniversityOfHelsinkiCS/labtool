import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import { Container } from 'semantic-ui-react'
import TestFile from './components/pages/TestFile.js'
import CoursePage from './components/pages/CoursePage'
import Email from './components/pages/Email.js'
import MyPageStudent from './components/pages/MyPageStudent'
import MyPageTeacher from './components/pages/MyPageTeacher'


const App = () => {
  return (
    <Container >
      <div>
        {/* <Header /> */}
        <Main />
      </div>
    </Container>
  )
}

const Main = () => {
  return (
    <main>
      <Switch>
        <Route exact path={`${process.env.PUBLIC_URL}/`} component={Login} />
        <Route path={`${process.env.PUBLIC_URL}/courses`} component={Courses} />
        <Route  path={`${process.env.PUBLIC_URL}/coursePage`} component={CoursePage} />
        <Route  path={`${process.env.PUBLIC_URL}/email`} component={Email} />
        <Route  path={`${process.env.PUBLIC_URL}/myPageStudent`} component={MyPageStudent} />
        <Route  path={`${process.env.PUBLIC_URL}/myPageTeacher`} component={MyPageTeacher} />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App