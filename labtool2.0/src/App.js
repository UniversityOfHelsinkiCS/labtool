import React from 'react'
import { Switch, Route } from 'react-router-dom'
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
        <Route path='/labtool/courses' component={Courses} />
        <Route path='/labtool/test' component={LoginPage} />
        {/* <Route path='/schedule' component={Schedule} /> */}
      </Switch>
    </main>
  )
}

export default connect(
  null,
  { courseInstanceInitialization }
)(App)
