import React, { Component } from 'react'
import { Button, List, Container, Header, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

class Courses extends Component {
  render() {
    return (
      <div>
        <Container>
          <Header as='h2' className='CoursesHeader'>Courses</Header>
          <Table singleline key='grey'>
            <Table.Body>
              {this.props.courseInstance.map(instance => 
                <Table.Row>
                  <Table.Cell>{instance.name}</Table.Cell>
                  <Table.Cell textAlign='right'><div>
                    <Link to={`/labtool/courses/${instance.ohid}`}><Button circular color="teal" size='tiny' icon="large black eye icon"></Button></Link>
                    <Button circular color='orange' size="tiny" icon="large black edit icon" />
                  </div></Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
          <div className="Instructions">
            <List>
              <List.Item icon='eye' content='Show course page' />
              <List.Item icon='edit' content='Edit course' />
              <List.Item icon='plus' content='Create course' />
            </List>
          </div>
        </Container>
      </div>

    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    courseInstance: state.courseInstance
  }
}

export default connect(mapStateToProps, null )(Courses)




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
