import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Courses from './components/pages/Courses'
import Login from './Login'
import { Container } from 'semantic-ui-react'
import TestFile from './components/pages/TestFile.js'
import CoursePage from './components/pages/CoursePage'


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
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default App