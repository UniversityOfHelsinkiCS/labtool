import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Header, Table, Container, List, Icon, Segment, Divider } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'

/**
 * The main page that is shown after user has logged in.
 */

class MyPage extends Component {
  // Checks if a user is logged in.
  componentDidMount() {
    try {
      const loggedUserJSON = window.localStorage.getItem('loggedLabtool')
      if (loggedUserJSON && loggedUserJSON !== '{}') {
        const user = JSON.parse(loggedUserJSON)
      }
    } catch (exception) {
      console.log('no user logged in')
    }
  }

  render() {
    const user = { ...this.props.user.user }
    return (
      <div>
        <Segment padded>
          <Container>
            <Header as="h2">
              {user.lastname}, {user.firsts}
            </Header>

            <Table singleLine color="blue" textAlign="left" style={{ color: 'grey' }}>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    <Icon name="user" size="big" style={{ marginRight: 20 }} />
                    <em style={{ color: 'grey' }}>{user.username} </em>
                    <br />
                  </Table.Cell>
                  <Table.Cell />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <Icon name="id card outline" size="big" style={{ marginRight: 20 }} />
                    {user.studentNumber}
                    <br />
                  </Table.Cell>
                  <Table.Cell />
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    <Icon name="mail" size="big" style={{ marginRight: 20 }} tooltip="Add users to your feed" />
                    {user.email}
                    <br />
                  </Table.Cell>
                  <Table.Cell textAlign="right" verticalAlign="bottom">
                    <Link to="/labtool/email">
                      <Button circular size="tiny" icon="large blue edit icon" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Container>
        </Segment>

        <div className="Instructions">
          <List>
            <List.Item icon="blue edit icon" content="Edit email address" />
          </List>
        </div>

        <br />
        <br />
        <br />
        <br />

        <Segment padded>
          <Container>
            <Header as="h2" className="CoursesHeader">
              My Courses (Student){' '}
            </Header>

            <Table singleLine key="grey" color="yellow">
              <Table.Body>
                {this.props.studentInstance.map(sinstance => (
                  <Table.Row>
                    <Table.Cell>{sinstance.name}</Table.Cell>
                    <Table.Cell textAlign="right">
                      <Link to={`/labtool/courses/${sinstance.ohid}`}>
                        <Button circular size="tiny" icon="large blue eye icon" />
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            <div>
              <br />
              <Divider horizontal />

              <Container>
                <Header as="h2" className="CoursesHeader">
                  My Courses (Teacher)
                </Header>

                <Table singleline key="grey" color="yellow">
                  <Table.Body>
                    {this.props.teacherInstance.map(tinstance => (
                      <Table.Row key={tinstance.id}>
                        <Table.Cell>{tinstance.name}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Link to={`/labtool/courses/${tinstance.ohid}`}>
                            <Button circular size="tiny" icon="large blue eye icon" />
                          </Link>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Container>
            </div>
          </Container>
        </Segment>
        <div className="Instructions">
          <List>
            <List.Item icon="blue eye icon" content="Show course page" />
          </List>
          <br />
          <br />
          <br />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance
  }
}

export default connect(mapStateToProps, {})(MyPage)
