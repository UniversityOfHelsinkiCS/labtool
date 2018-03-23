import { Table } from 'semantic-ui-react'
import React, { Component } from 'react'
import { Button, List, Container, Header } from 'semantic-ui-react'
import { Switch, Route } from 'react-router-dom'
import AllCourses from './AllCourses'
import Course from './Course'

class Courses extends Component {
  render() {
    return (
      <div>
        <Container>
          <Header as='h2' className='CoursesHeader'>Courses</Header>
          <Table singleline key='grey'>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)</Table.Cell>
                <Table.Cell textAlign='right'><div>
                  <Button circular color="teal" size='tiny' icon="large black eye icon" />
                  <Button circular color='orange' size="tiny" icon="large black edit icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)</Table.Cell>
                <Table.Cell textAlign='right'><div>
                  <Button circular color="teal" size="tiny" icon="large black eye icon" />
                  <Button circular color='orange' size="tiny" icon="large black edit icon" />
                </div></Table.Cell>
                <Table.Cell textAlign='center'></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi III)</Table.Cell>
                <Table.Cell textAlign='right'><div>
                  <Button circular color="teal" size="tiny" icon="large black eye icon" />
                  <Button circular color='orange' size="tiny" icon="large black edit icon"></Button>
                </div></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <div className="Instructions">
            <List>
              <List.Item icon='eye' content='Show course page' />
              <List.Item icon='edit' content='Edit course' />
              <List.Item icon='plus' content='Create course' />
            </List>
          </div>
        </Container> </div>
    )
  }
}

export default Courses




/* import React, { Component } from 'react'
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
*/
