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
import { getAcademicYear } from '../../util/format'

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
        <Link to={`/labtool/courses/${instance.ohid}`}>
          {instance.name} ({getAcademicYear(instance.start)})
        </Link>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Link to={`/labtool/courses/${instance.ohid}`}>
          <Popup trigger={<Button circular size="tiny" icon={{ name: 'eye', size: 'large', color: 'blue' }} />} content="View course" />
        </Link>
      </Table.Cell>
    </Table.Row>
  )

  const user = { ...props.user.user }
  return (
    <div className="MyPage">
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
                    <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'blue' }} />} content="Edit email address" />
                  </Link>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Container>
      </Segment>

      <br />
      <br />
      <br />
      <br />

      <Segment padded>
        <Container>
          <Header as="h2" className="CoursesHeader">
            My Courses (Student){' '}
          </Header>

          <HorizontalScrollable>
            <Table singleLine key="grey" color="yellow" style={{ overflowX: 'visible' }}>
              <Table.Body>{props.studentInstance.map(renderCourseRow)}</Table.Body>
            </Table>
          </HorizontalScrollable>

          <div>
            <br />
            <Divider horizontal />

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
        </Container>
      </Segment>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance
  }
}

MyPage.propTypes = {
  user: PropTypes.object.isRequired,
  studentInstance: PropTypes.array.isRequired,
  teacherInstance: PropTypes.array.isRequired,

  getAllStudentCourses: PropTypes.func.isRequired,
  getAllTeacherCourses: PropTypes.func.isRequired,
  getIsAllowedToImport: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  { getAllStudentCourses, getAllTeacherCourses, getIsAllowedToImport }
)(MyPage)
