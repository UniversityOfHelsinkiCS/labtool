import { Table } from 'semantic-ui-react'
import React, { Component } from 'react'
import { Button, List } from 'semantic-ui-react'
import { Switch, Route } from 'react-router-dom'
import AllCourses from './AllCourses'
import Course from './Course'

class Courses extends Component {
  render() {
    return (
      <div >
        <h2 > Courses </h2>
        <h4 />
        <List divided verticalAlign='middle'>
          <List.Item>
            <List.Content floated='right'>
              <Button color='blue'> <List.Item icon='eye' size='big' /></Button>
              <Button color='orange'>  <List.Item icon='edit' size='big' /></Button>
            </List.Content>
            <List.Content>
              <h3> Tietokantasovellus 2018 Kevät </h3>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Content floated='right'>
              <Button color='blue'>  <List.Item icon='eye' size='big' /></Button>
              <Button color='orange'>  <List.Item icon='edit' size='big' /></Button>
            </List.Content>
            <List.Content>
              <h3> Tiralabra 2017 Kesä </h3>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Content floated='right'>
              <Button color='blue'>  <List.Item icon='eye' size='big' /></Button>
              <Button color='orange'>  <List.Item icon='edit' size='big' /></Button>
            </List.Content>
            <List.Content>
              <h3> Tietokantasovellus 2016 Syksy </h3>
            </List.Content>
          </List.Item>
          <List.Item>
            <List.Content floated='right'>
              <Button color='blue'>  <List.Item icon='eye' size='big' /></Button>
              <Button color='orange'>  <List.Item icon='edit' size='big' /></Button>
            </List.Content>
            <List.Content>
              <h3> Tiralabra 2018 Syksy</h3>
            </List.Content>
          </List.Item>
        </List>
      </div>
    )
  }
}

export default Courses




/* import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import AllCourses from './AllCourses'
import Course from './Course'

class Courses extends Component {
    

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
*/
