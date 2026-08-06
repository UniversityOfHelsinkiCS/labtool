import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Header, Table, Container, Icon, Segment, Divider, Popup } from 'semantic-ui-react'
import './MyPage.css'
import { Link } from 'react-router-dom'
import { getAllStudentCourses } from '../../services/studentinstances'
import { getAllTeacherCourses } from '../../services/teacherinstances'
import { getIsAllowedToImport } from '../../services/courseImport'
import { HorizontalScrollable } from '../HorizontalScrollable'
import { formatCourseName } from '../../util/format'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'

/**
 * The main page that is shown after user has logged in.
 */

export const MyPage = props => {
  useEffect(() => {
    // run on component mount
    props.getAllStudentCourses()
    props.getAllTeacherCourses()
    props.getIsAllowedToImport()
  }, [])

  const renderCourseRow = instance => (
    <Table.Row key={instance.id}>
      <Table.Cell>
        <Link to={`/labtool/courses/${instance.ohid}`}>{formatCourseName(instance.name, instance.ohid, instance.start)}</Link>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Link to={`/labtool/courses/${instance.ohid}`}>
          <Popup trigger={<Button circular size="tiny" icon={{ name: 'eye', size: 'large', color: 'blue' }} />} content="View course" />
        </Link>
      </Table.Cell>
    </Table.Row>
  )

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  const user = { ...props.user.user }
  const showStudent = props.studentInstance.length > 0
  const showTeacher = props.teacherInstance.length > 0
  return (
    <>
      <DocumentTitle title="My page" />
      <div className="MyPage">
        <Container>
          <Segment padded>
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
                      <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'blue' }} />} content="Edit email address" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Segment>
        </Container>

        <br />
        <br />
        <br />
        <br />

        {(showStudent || showTeacher) && (
          <Container>
            <Segment padded>
              {showStudent && (
                <div>
                  <Header as="h2" className="CoursesHeader">
                    My Courses (Student){' '}
                  </Header>

                  <HorizontalScrollable>
                    <Table singleLine key="grey" color="yellow" style={{ overflowX: 'visible' }}>
                      <Table.Body>{props.studentInstance.map(renderCourseRow)}</Table.Body>
                    </Table>
                  </HorizontalScrollable>
                </div>
              )}

              {showTeacher && (
                <div>
                  {showStudent && (
                    <>
                      <br />
                      <Divider horizontal />
                    </>
                  )}

                  <Container>
                    <Header as="h2" className="CoursesHeader">
                      My Courses (Teacher)
                    </Header>

                    <HorizontalScrollable>
                      <Table singleLine key="grey" color="yellow" style={{ overflowX: 'visible' }}>
                        <Table.Body>{props.teacherInstance.map(renderCourseRow)}</Table.Body>
                      </Table>
                    </HorizontalScrollable>
                  </Container>
                </div>
              )}
            </Segment>
          </Container>
        )}
      </div>
    </>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

MyPage.propTypes = {
  user: PropTypes.object.isRequired,
  studentInstance: PropTypes.array.isRequired,
  teacherInstance: PropTypes.array.isRequired,

  getAllStudentCourses: PropTypes.func.isRequired,
  getAllTeacherCourses: PropTypes.func.isRequired,
  getIsAllowedToImport: PropTypes.func.isRequired,

  errors: PropTypes.array
}

export default connect(mapStateToProps, { getAllStudentCourses, getAllTeacherCourses, getIsAllowedToImport })(MyPage)
