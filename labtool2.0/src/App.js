import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import { Container } from 'semantic-ui-react'
import TestFile from './components/pages/TestFile.js'
import CoursePage from './components/pages/CoursePage'
import Email from './components/pages/Email.js'
import LoginPage from './components/pages/LoginPage.js'
import ModifyCourseInstancePage from './components/pages/ModifyCourseInstancePage'
import ReviewStudent from './components/pages/ReviewStudent'

// Tähän navigation bar
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
        <Route path={`${process.env.PUBLIC_URL}/loginPage`} component={LoginPage} />     
        <Route path={`${process.env.PUBLIC_URL}/reviewstudent`} component={ReviewStudent} />     
        <Route path={`${process.env.PUBLIC_URL}/ModifyCourseInstancePage`} component={ModifyCourseInstancePage} />   
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App