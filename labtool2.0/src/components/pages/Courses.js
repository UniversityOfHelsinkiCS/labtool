import React from 'react'
import { Switch, Route } from 'react-router-dom'
import AllCourses from './AllCourses'
import Course from './Course'

class Courses extends React.Component {
    

  render() {
    return (
      <div style={{ textAlignVertical: 'center', textAlign: 'center', }}>
        <h2>Kursseja!</h2>
        <Switch>
          <Route exact path={`${process.env.PUBLIC_URL}/courses`} component={AllCourses} />
          <Route path={`${process.env.PUBLIC_URL}/courses:number`} component={Course} />
        </Switch>
      </div >
    )
  }
}


export default Courses