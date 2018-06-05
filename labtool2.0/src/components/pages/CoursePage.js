import React, { Component } from 'react'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { associateTeacherToStudent } from '../../services/assistant'
import ReactMarkdown from 'react-markdown'
import { showDropdown, selectTeacher, filterByAssistant, coursePageReset } from '../../reducers/coursePageLogicReducer'

export class CoursePage extends React.Component {
  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: false,
      comment: e.target.content.value,
      week: parseInt(e.target.name, 10),
      from: this.props.user.user.username
    }
    try {
      await this.props.createOneComment(content)
      await this.props.coursePageInformation(this.props.selectedInstance.ohid)
      document.getElementById('comment').reset()
    } catch (error) {
      console.log(error)
    }
  }

  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
  }

  componentWillUnmount() {
    this.props.coursePageReset()
  }

  changeHidden = id => {
    return () => {
      this.props.showDropdown(this.props.coursePageLogic.showDropdown === id ? '' : id)
    }
  }

  changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTeacher(value)
    }
  }

  changeFilterAssistant = () => {
    return (e, data) => {
      const { value } = data
      this.props.filterByAssistant(value)
    }
  }

  updateTeacher = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentInstanceId: id,
        teacherInstanceId: this.props.coursePageLogic.selectedTeacher
      }
      await this.props.associateTeacherToStudent(data)
    } catch (error) {
      console.log(error)
    }
  }

  createDropdownTeachers = array => {
    if (this.props.selectedInstance.teacherInstances !== undefined) {
      this.props.selectedInstance.teacherInstances.map(m =>
        array.push({
          key: m.id,
          text: m.firsts + ' ' + m.lastname,
          value: m.id
        })
      )
      return array
    }
    return []
  }

  /**
   * Shows all information related to a course from user,
   * with information shown depending on whether the user
   * is a teacher or student on a course.
   */
  render() {
    const createIndents = (data, siId) => {
      const indents = []

      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        let pushattava = (
          <Table.Cell key={i}>
            <p>Not reviewed!</p>
          </Table.Cell>
        )

        for (var j = 0; j < data.length; j++) {
          if (i + 1 === data[j].weekNumber) {
            pushattava = (
              <Table.Cell key={i}>
                <p>{data[j].points}</p>
                {/*               <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${siId}/${i + 1}`}>
                <Button circular color='orange' size="tiny" icon="edit black large" ></Button>
          </Link> */}
              </Table.Cell>
            )
          }
        }
        indents.push(pushattava)
      }
      return indents
    }

    const createHeaders = () => {
      const headers = []
      for (var i = 0; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(<Table.HeaderCell key={i}>Week {i + 1} </Table.HeaderCell>)
      }
      return headers
    }

    let dropDownTeachers = []
    dropDownTeachers = this.createDropdownTeachers(dropDownTeachers)
    let dropDownFilterTeachers = [
      {
        key: 0,
        text: 'no filter',
        value: 0
      },
      {
        key: null,
        text: 'unassigned students',
        value: null
      }
    ]
    dropDownFilterTeachers = this.createDropdownTeachers(dropDownFilterTeachers)

    return (
      <div className="CoursePage" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <div className="ui grid">
          <div className="sixteen wide column">
            <h2>{this.props.selectedInstance.name}</h2>
          </div>
          {this.props.selectedInstance.active === true ? (
            this.props.courseData.role === 'teacher' || this.props.courseData.data !== null ? (
              <p />
            ) : this.props.selectedInstance.registrationAtWebOodi === 'notfound' ? (
              <div className="sixteen wide column">
                <Message compact>
                  <Message.Header>No registration found at WebOodi.</Message.Header>
                  <p>If you have just registered, please try again in two hours.</p>
                </Message>
              </div>
            ) : (
              <div className="sixteen wide column">
                <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>
                  {' '}
                  <Button color="blue" size="large">
                    Register
                  </Button>
                </Link>
              </div>
            )
          ) : this.props.courseData.role === 'teacher' ? (
            <div className="sixteen wide column">
              <Message compact>
                <Message.Header>You have not activated this course.</Message.Header>
              </Message>
            </div>
          ) : (
            <div className="sixteen wide column">
              <Message compact>
                <Message.Header>This course has not been activated.</Message.Header>
              </Message>
            </div>
          )}
        </div>

        {/** Shown when the users role in this course is teacher.*/}
        {this.props.courseData.role === 'teacher' ? (
          <div className="TeachersView">
            <br />
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell>
                    <div>
                      {this.props.selectedInstance.active === true ? (
                        <Label ribbon style={{ backgroundColor: '#21ba45' }}>
                          Active
                        </Label>
                      ) : (
                        ''
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>Week amount: {this.props.selectedInstance.weekAmount}</Table.Cell>
                  <Table.Cell>Current week: {this.props.selectedInstance.currentWeek}</Table.Cell>
                  <Table.Cell>Week maxpoints: {this.props.selectedInstance.weekMaxPoints}</Table.Cell>
                  <Table.Cell textAlign="right">
                    {' '}
                    <Link to={`/labtool/ModifyCourseInstancePage/${this.props.selectedInstance.ohid}`}>
                      <Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'orange' }} />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Header>
            </Table>
            <List style={{ float: 'right' }}>
              <List.Item icon={{ name: 'edit', color: 'orange' }} content="Edit course" />
            </List>

            <br />
            <Header as="h2">Students </Header>
            <div style={{ textAlign: 'left' }}>
              <span>Filter by assigned teacher </span>
              <Dropdown
                options={dropDownFilterTeachers}
                onChange={this.changeFilterAssistant()}
                placeholder="Select Teacher"
                defaultValue={this.props.coursePageLogic.filterByAssiSstant}
                fluid
                selection
                style={{ display: 'inline' }}
              />
            </div>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell> Github </Table.HeaderCell>
                  {createHeaders()}
                  <Table.HeaderCell> Sum </Table.HeaderCell>
                  <Table.HeaderCell width="six"> Instructor </Table.HeaderCell>
                  <Table.HeaderCell> Review </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.courseData.data
                  .filter(data => {
                    return this.props.coursePageLogic.filterByAssistant === 0 || this.props.coursePageLogic.filterByAssistant === data.teacherInstanceId
                  })
                  .map(data => (
                    <Table.Row key={data.id}>
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>
                        <p>{data.projectName}</p>
                        <a href={data.github}>{data.github}</a>
                      </Table.Cell>
                      {createIndents(data.weeks, data.id)}
                      <Table.Cell>
                        {data.weeks.map(week => week.points).reduce((a, b) => {
                          return a + b
                        }, 0)}
                      </Table.Cell>
                      <Table.Cell>
                        {data.teacherInstanceId && this.props.selectedInstance.teacherInstances ? (
                          this.props.selectedInstance.teacherInstances.filter(teacher => teacher.id === data.teacherInstanceId).map(teacher => (
                            <p key={data.id}>
                              Assistant: {teacher.firsts} {teacher.lastname}
                            </p>
                          ))
                        ) : (
                          <p>Assistant: not given</p>
                        )}
                        <Icon onClick={this.changeHidden(data.id)} name="pencil" size="small" />
                        {this.props.coursePageLogic.showDropdown === data.id ? (
                          <div>
                            <Dropdown options={dropDownTeachers} onChange={this.changeSelectedTeacher()} placeholder="Select Teacher" fluid selection />
                            {/* <select style={{}}onChange={this.changeSelectedTeacher()}>
                              <option value="" disabled selected>Select your option</option>
                              {dropDownTeachers.map(m => (
                                <option key={m.value} value={m.value}>
                                  {m.text}
                                </option>
                              ))}
                            </select> */}
                            {/* <Dropdown onChange={this.changeSelectedTeacher()} placeholder="Select Teacher" fluid search selection options={dropDownTeachers} /> */}
                            <Button onClick={this.updateTeacher(data.id, data.teacherInstanceId)} size="small">
                              Change instructor
                            </Button>
                          </div>
                        ) : (
                          <div />
                        )}
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${data.id}`}>
                          <Button circular size="tiny" icon={{ name: 'star', size: 'large', color: 'orange' }} />
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
            <List style={{ float: 'right' }}>
              <List.Item icon={{ name: 'star', color: 'orange' }} content="Review student" />
              <List.Item icon={{ name: 'pencil' }} content="Change student teacher" />
            </List>
          </div>
        ) : (
          <div />
        )}

        {/** Shown when the users role in this course is student.*/}
        {this.props.courseData.role === 'student' && this.props.courseData.data !== null ? (
          <div className="StudentsView">
            <h3> </h3>

            <Card fluid color="yellow">
              <Card.Content>
                <h3> {this.props.courseData.data.projectName} </h3>
                <h3>
                  {' '}
                  <a href={this.props.courseData.data.github}>{this.props.courseData.data.github}</a>{' '}
                </h3>

                {this.props.courseData.data.teacherInstanceId && this.props.selectedInstance.teacherInstances ? (
                  this.props.selectedInstance.teacherInstances.filter(teacher => teacher.id === this.props.courseData.data.teacherInstanceId).map(teacher => (
                    <h3 key={teacher.id}>
                      Assistant: {teacher.firsts} {teacher.lastname}
                    </h3>
                  ))
                ) : (
                  <h3>Assistant: not given</h3>
                )}
              </Card.Content>
            </Card>

            <Card fluid color="yellow">
              <Card.Content>
                {this.props.courseData.data.codeReviews ? (
                  this.props.courseData.data.codeReviews.map(
                    codeReview =>
                      codeReview.reviewNumber ? (
                        <div>
                          <div>
                            <h4>Number: {codeReview.reviewNumber}</h4>
                          </div>
                          <div>
                            <h4>Target: {codeReview.toReview}</h4>
                          </div>
                        </div>
                      ) : (
                        <div />
                      )
                  )
                ) : (
                  <h3>Ei ollut code reviewsejä</h3>
                )}
              </Card.Content>
            </Card>

            <h3> Points and feedback </h3>

            <Table celled padded unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Week</Table.HeaderCell>
                  <Table.HeaderCell>Points</Table.HeaderCell>
                  <Table.HeaderCell>Feedback</Table.HeaderCell>
                  <Table.HeaderCell>Comments</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.courseData.data.weeks.sort((a, b) => a.weekNumber - b.weekNumber).map(week => (
                  <Table.Row key={week.weekNumber}>
                    <Table.Cell>{week.weekNumber}</Table.Cell>
                    <Table.Cell>{week.points}</Table.Cell>
                    <Table.Cell>
                      <ReactMarkdown>{week.feedback}</ReactMarkdown>
                    </Table.Cell>
                    <Table.Cell>
                      <Comment.Group>
                        {week.comments.filter(c => c.hidden !== true).map(comment => (
                          <Comment key={comment.id}>
                            <Comment.Author>{comment.from}</Comment.Author>
                            <Comment.Text>
                              {' '}
                              <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                            </Comment.Text>
                          </Comment>
                        ))}
                      </Comment.Group>
                      <Form reply onSubmit={this.handleSubmit} name={week.id} id="comment">
                        <Form.TextArea name="content" placeholder="Your comment..." />

                        <Button content="Add Reply" labelPosition="left" icon="edit" primary />
                      </Form>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        ) : (
          <div />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    studentInstance: state.studentInstance,
    teacherInstance: state.teacherInstance,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage,
    coursePageLogic: state.coursePageLogic,
    courseId: ownProps.courseId
  }
}

export default connect(mapStateToProps, { createOneComment, getOneCI, coursePageInformation, associateTeacherToStudent, showDropdown, selectTeacher, filterByAssistant, coursePageReset })(CoursePage)
