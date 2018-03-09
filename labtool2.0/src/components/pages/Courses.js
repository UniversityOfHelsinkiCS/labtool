import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import AllCourses from './AllCourses'
import Course from './Course'

class Courses extends Component {
    

  render() {
    return (
      <div>
        <h2>Kursseja!</h2>
        <Switch>
          <Route exact path='/courses' component={AllCourses} />
          <Route path='/courses/:number' component={Course} />
        </Switch>
      </div >
    )
  }
}


export default Courses