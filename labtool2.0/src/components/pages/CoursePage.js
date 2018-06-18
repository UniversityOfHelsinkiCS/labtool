import React from 'react'
import { Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { associateTeacherToStudent } from '../../services/assistant'
import ReactMarkdown from 'react-markdown'
import { showDropdown, selectTeacher, filterByAssistant, filterByTag, coursePageReset, toggleCodeReview } from '../../reducers/coursePageLogicReducer'

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

  addFilterTag = tag => {
    return () => {
      this.props.filterByTag(tag)
    }
  }

  hasFilteringTags = (studentTagsData, filteringTags) => {
    let studentInstanceTagIds = studentTagsData.map(tag => tag.id)
    let filteringTagIds = filteringTags.map(tag => tag.id)
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (studentInstanceTagIds.includes(filteringTagIds[i])) {
        return true
      }
    }
    return false
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
    const numberOfCodeReviews = Array.isArray(this.props.courseData.data) ? Math.max(...this.props.courseData.data.map(student => student.codeReviews.length)) : 0

    const createIndents = (weeks, codeReviews, siId) => {
      const indents = []
      let i = 0
      for (; i < this.props.selectedInstance.weekAmount; i++) {
        let pushattava = (
          <Table.Cell key={i}>
            <p>-</p>
          </Table.Cell>
        )

        for (var j = 0; j < weeks.length; j++) {
          if (i + 1 === weeks[j].weekNumber) {
            pushattava = (
              <Table.Cell key={i}>
                <p>{weeks[j].points}</p>
              </Table.Cell>
            )
          }
        }
        indents.push(pushattava)
      }
      let ii = 0
      codeReviews.forEach(cr => {
        indents.push(<Table.Cell key={i + ii}>{cr.points !== null ? <p>{cr.points}</p> : <p>-</p>}</Table.Cell>)
        ii++
      })
      while (ii < numberOfCodeReviews) {
        indents.push(
          <Table.Cell key={i + ii}>
            <p>-</p>
          </Table.Cell>
        )
        ii++
      }
      return indents
    }

    const createHeaders = () => {
      const headers = []
      let i = 0
      for (; i < this.props.selectedInstance.weekAmount; i++) {
        headers.push(<Table.HeaderCell key={i}>Week {i + 1} </Table.HeaderCell>)
      }
      for (var ii = 1; ii <= numberOfCodeReviews; ii++) {
        headers.push(<Table.HeaderCell key={i + ii}>Code Review {ii} </Table.HeaderCell>)
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
          <div className="TeachersView" style={{ overflowX: 'auto' }}>
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
                      <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'orange' }} />} content="Edit course" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              </Table.Header>
            </Table>
            <br />
            <Header as="h2">Students </Header>
            <div style={{ textAlign: 'left' }}>
              <span>Filter by instructor </span>
              <Dropdown
                options={dropDownFilterTeachers}
                onChange={this.changeFilterAssistant()}
                placeholder="Select Teacher"
                defaultValue={this.props.coursePageLogic.filterByAssistant}
                fluid
                selection
                style={{ display: 'inline' }}
              />
              <span> Tags chosen: </span>
              {this.props.coursePageLogic.filterByTag.length === 0 ? (
                <span>
                  <Label>none</Label>
                </span>
              ) : (
                <span>
                  {this.props.coursePageLogic.filterByTag.map(tag => (
                    <span key={tag.id}>
                      <Button compact className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                        {tag.name}
                      </Button>
                    </span>
                  ))}
                </span>
              )}
            </div>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Project Info</Table.HeaderCell>
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
                  .filter(data => {
                    return this.props.coursePageLogic.filterByTag.length === 0 || this.hasFilteringTags(data.Tags, this.props.coursePageLogic.filterByTag)
                  })
                  .map(data => (
                    <Table.Row key={data.id}>
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>
                        <p>
                          {data.projectName}
                          <br />
                          <a href={data.github}>{data.github}</a>
                        </p>
                        {data.Tags.map(tag => (
                          <div key={tag.id}>
                            <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                              {tag.name}
                            </Button>
                          </div>
                        ))}
                      </Table.Cell>
                      {createIndents(data.weeks, data.codeReviews, data.id)}
                      <Table.Cell>
                        {data.weeks.map(week => week.points).reduce((a, b) => {
                          return a + b
                        }, 0) +
                          data.codeReviews.map(cr => cr.points).reduce((a, b) => {
                            return a + b
                          }, 0)}
                      </Table.Cell>
                      <Table.Cell>
                        {data.teacherInstanceId && this.props.selectedInstance.teacherInstances ? (
                          this.props.selectedInstance.teacherInstances.filter(teacher => teacher.id === data.teacherInstanceId).map(teacher => (
                            <span key={data.id}>
                              {teacher.firsts} {teacher.lastname}
                            </span>
                          ))
                        ) : (
                          <span>not assigned</span>
                        )}
                        <Popup trigger={<Button circular onClick={this.changeHidden(data.id)} icon={{ name: 'pencil', size: 'medium' }} style={{ float: 'right' }} />} content="Assign instructor" />
                        {this.props.coursePageLogic.showDropdown === data.id ? (
                          <div>
                            <Dropdown options={dropDownTeachers} onChange={this.changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
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
                          <Popup trigger={<Button circular size="tiny" icon={{ name: 'star', size: 'large', color: 'orange' }} />} content="Review student" />
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </div>
        ) : (
          <div />
        )}

        {/** Shown when the users role in this course is student.*/}
        {this.props.courseData.role === 'student' && this.props.courseData.data !== null ? (
          <div className="StudentsView" style={{ overflowX: 'auto' }}>
            <h3> </h3>

            <Card fluid color="yellow">
              <Card.Content>
                <h3> {this.props.courseData.data.projectName} </h3>
                <h3>
                  {' '}
                  <a href={this.props.courseData.data.github}>{this.props.courseData.data.github}</a>{' '}
                  <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>
                    <Popup trigger={<Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />} content="Edit project details" />
                  </Link>
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

            <Card fluid color="yellow">
              <Card.Content>
                {this.props.courseData.data.codeReviews ? (
                  this.props.courseData.data.codeReviews.map(
                    codeReview =>
                      codeReview.reviewNumber ? (
                        <Card fluid color="yellow" key={codeReview.reviewNumber} className="codeReview">
                          <Card.Content header={'Code review ' + codeReview.reviewNumber} onClick={() => this.props.toggleCodeReview(codeReview.reviewNumber)} style={{ cursor: 'pointer' }} />
                          {codeReview.points !== null ? <Card.Content className="codeReviewPoints">{codeReview.points + ' points'}</Card.Content> : <div />}
                          {this.props.coursePageLogic.showCodeReviews.indexOf(codeReview.reviewNumber) !== -1 ? (
                            <div className="codeReviewExpanded">
                              <Card.Content>
                                <h4>Project to review</h4>
                                <p>{codeReview.toReview.projectName}</p>
                                <p>
                                  <a href={codeReview.toReview.github}>{codeReview.toReview.github}</a>
                                </p>
                              </Card.Content>
                            </div>
                          ) : (
                            <div />
                          )}
                        </Card>
                      ) : (
                        <div />
                      )
                  )
                ) : (
                  <h3>Ei ollut code reviewsejä</h3>
                )}
              </Card.Content>
            </Card>
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

const mapDispatchToProps = {
  createOneComment,
  getOneCI,
  coursePageInformation,
  associateTeacherToStudent,
  showDropdown,
  selectTeacher,
  filterByAssistant,
  filterByTag,
  coursePageReset,
  toggleCodeReview
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
