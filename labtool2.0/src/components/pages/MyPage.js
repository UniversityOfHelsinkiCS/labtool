import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card, Button, Checkbox, Header, Table, Container } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'

class MyPage extends Component {
  componentDidMount() {
    //this.props.getAllStudentCourses()
    //this.props.getAllTeacherCourses()
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
        this.props.tokenLogin(user)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  editEmail = event => {
    event.preventDefault()
  }

  render() {
    return (
      <div>
        <Card fluid color="yellow">
          <Card.Content>
            <Table fixed basic="very">
              <Table.Header>
                <Header as="h3" block>
                  {this.props.user.firsts} {this.props.user.lastname}
                </Header>
              </Table.Header>
              <Table.Row>
                <Table.Cell>
                  <Card.Description>
                    <Header size="small">{this.props.user.studentNumber}</Header>
                  </Card.Description>
                </Table.Cell>
                <Table.Cell>
                  <Card.Description>{this.props.user.email}</Card.Description>
                </Table.Cell>

                <Table.Cell>
                  <Link to="/labtool/email">
                    <Button color="yellow" icon="edit" />
                  </Link>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell />
                <Table.Cell>I want to receive notifications for receiving feedback etc.</Table.Cell>
                <Table.Cell>
                  <Checkbox />
                </Table.Cell>
              </Table.Row>
            </Table>
          </Card.Content>
        </Card>
        <br />
        <Container>
          <Header as="h2" className="CoursesHeader">
            My Courses (Student){' '}
          </Header>
          <Table singleline>
            <Table.Body>
              {this.props.studentInstance.map(sinstance => (
                <Table.Row>
                  <Table.Cell>{sinstance.name}</Table.Cell>
                  <Table.Cell textAlign="right">
                    <div>
                      <Link to={`/labtool/courses/${sinstance.ohid}`}>
                        <Button circular color="teal" size="tiny" icon="large black eye icon" />
                      </Link>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div className="Instructions">
            <br />

            <Container>
              <Header as="h2" className="CoursesHeader">
                My Courses (Teacher)
              </Header>
              <Table singleline key="grey">
                <Table.Body>
                  {this.props.teacherInstance.map(tinstance => (
                    <Table.Row>
                      <Table.Cell>{tinstance.name}</Table.Cell>
                      <Table.Cell textAlign="right">
                        <div>
                          <Link to={`/labtool/courses/${tinstance.ohid}`}>
                            <Button circular color="teal" size="tiny" icon="large black eye icon" />
                          </Link>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Container>
          </div>
        </Container>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance
  }
}

export default connect(mapStateToProps, {})(MyPage)
