import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card, Button, Checkbox, Header, Table, Container, List } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'
import { getAllStudentCourses } from '../../services/studentinstances'
import { getAllTeacherCourses } from '../../services/teacherinstances'
import { Redirect } from 'react-router'

class MyPageStudent extends Component {
  componentDidMount() {
    this.props.getAllStudentCourses()
    this.props.getAllTeacherCourses()
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
        this.props.tokenLogin(user)
      }
    } catch (exception) {
      console.log('no user logged in')
    }
  }
  

  editEmail = (event) => {
    event.preventDefault()

  }

  render() {
    console.log(user)
    const user = { ...this.props.user.user }
    if (user.email === '' || user.email === null) {
      return (
        <Redirect to='email' />
      )
    }
    return (
      <div>
        <Card fluid color='yellow'>
          <Card.Content>
            <Table fixed basic='very'>
              <Table.Header>
                <Header as='h3' block>
                  {user.firsts} {user.lastname}
                </Header>
              </Table.Header>
              <Table.Row>
                <Table.Cell><Card.Description><Header size='small'>{user.studentNumber}</Header></Card.Description></Table.Cell>
                <Table.Cell><Card.Description>{user.email}</Card.Description></Table.Cell>
                <Table.Cell><Button color='yellow' ><Link to="/email" > <List.Item icon='edit' /></Link></Button></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell>I want to receive notifications for receiving feedback etc.</Table.Cell>
                <Table.Cell><Checkbox /></Table.Cell>
              </Table.Row>
            </Table>
          </Card.Content>
        </Card>
        <br />
        <Container>
          <Header as='h2' className='CoursesHeader'>My Courses  (Student) </Header>
          <Table singleline>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)</Table.Cell>
                <Table.Cell textAlign='left'><div>
                  <Button circular color='teal' size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)</Table.Cell>
                <Table.Cell textAlign='left'><div>
                  <Button circular color="teal" size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi III)</Table.Cell>
                <Table.Cell textAlign='left'><div>
                  <Button circular color='teal' size="tiny" icon="large black eye icon"></Button>
                </div></Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          <div className="Instructions">
            <br />

            <Container>
              <Header as='h2' className='CoursesHeader'>My Courses  (Teacher)</Header>
              <Table singleline key='grey'>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi IV)</Table.Cell>
                    <Table.Cell textAlign='right'><div>
                      <Button circular color='orange' size="tiny" icon="large black edit icon" />
                      <Button circular color='teal' size="tiny" icon="large black eye icon" />
                    </div></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Aineopintojen harjoitustyö: Tietokantasovellus (periodi IV)</Table.Cell>
                    <Table.Cell textAlign='right'><div>
                      <Button circular color='orange' size="tiny" icon="large black edit icon" />
                      <Button circular color = 'teal' size="tiny" icon="large black eye icon" />
                    </div></Table.Cell>
                    <Table.Cell textAlign='center'></Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit (periodi III)</Table.Cell>
                    <Table.Cell textAlign='right'><div>
                      <Button circular color='orange' size="tiny" icon="large black edit icon" />
                      <Button circular color='teal' size="tiny" icon="large black eye icon"></Button>
                    </div></Table.Cell>
                    <Table.Cell></Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Container>
          </div>
        </Container>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}


export default connect(mapStateToProps, { getAllStudentCourses, getAllTeacherCourses })(MyPageStudent)