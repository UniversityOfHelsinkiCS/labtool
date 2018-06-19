import React from 'react'
import { Accordion, Button, Table, Card, Form, Comment, List, Header, Label, Message, Icon, Dropdown, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { associateTeacherToStudent } from '../../services/assistant'
import ReactMarkdown from 'react-markdown'
import { getAllTags, tagStudent } from '../../services/tags'
import {
  showAssistantDropdown,
  showTagDropdown,
  filterByTag,
  filterByAssistant,
  updateActiveIndex,
  selectTeacher,
  selectTag,
  coursePageReset,
  toggleCodeReview
} from '../../reducers/coursePageLogicReducer'

export class CoursePage extends React.Component {

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const theNewIndex = this.props.coursePageLogic.activeIndex === index ? -1 : index
    this.props.updateActiveIndex(theNewIndex)
  }

  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: false,
      comment: e.target.content.value,
      week: parseInt(e.target.name, 10),
      from: this.props.user.user.username
    }
    document.getElementById(e.target.name).reset()
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
    this.props.getAllTags()
  }

  weekNumberOfLastReviewedWeek() {
    if (this.props.courseData && this.props.courseData.data && this.props.courseData.data.weeks !== undefined
      && this.props.courseData.data.weeks.length > 0) {
      if (this.state.showLastReviewed) {
        let lastIndexOfWeeks = this.props.courseData.data.weeks.length - 1
        let lastReviewedWeek = this.props.courseData.data.weeks[lastIndexOfWeeks].weekNumber
        return lastReviewedWeek
      }
    }
  }  

  componentWillUnmount() {
    this.setState({ showLastReviewed: true })
    this.props.coursePageReset()
  }

  changeHiddenAssistantDropdown = id => {
    return () => {
      this.props.showAssistantDropdown(this.props.coursePageLogic.showAssistantDropdown === id ? '' : id)
    }
  }

  changeHiddenTagDropdown = id => {
    return () => {
      this.props.showTagDropdown(this.props.coursePageLogic.showTagDropdown === id ? '' : id)
    }
  }

  changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTeacher(value)
    }
  }

  changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTag(value)
    }
  }

  addTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: this.props.coursePageLogic.selectedTag
      }
      await this.props.tagStudent(data)
    } catch (error) {
      console.log(error)
    }
  }

  changeFilterAssistant = () => {
    return (e, data) => {
      const { value } = data
      this.props.filterByAssistant(value)
    }
  }

  changeFilterTag = id => {
    return () => {
      if (this.props.coursePageLogic.filterByTag === id) {
        this.props.filterByTag(0)
      } else {
        this.props.filterByTag(id)
      }
    }
  }

  hasFilteredTag = (data, id) => {
    for (let i = 0; i < data.Tags.length; i++) {
      if (data.Tags[i].id === id) {
        return data
      }
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

  createDropdownTags = array => {
    if (this.props.tags.tags != undefined) {
      this.props.tags.tags.map(tag =>
        array.push({
          key: tag.id,
          text: tag.name,
          value: tag.id
        })
      )
      console.log('tags: ', array)
      return array
    }
    console.log('ei tageja')
    return []
  }

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
        indents.push(<Table.Cell key={i + ii}>{cr.points !== null ? <p className="codeReviewPoints">{cr.points}</p> : <p>-</p>}</Table.Cell>)
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

    /**
     * Helper function for renderTeacherBottom
     */
    const createHeadersTeacher = () => {
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


    const renderStudentBottomPart = () => {
      let headers = []
      // studentInstance is id of student. Type: String
      // Tämä pitää myös korjata.
      headers.push(
        <Card key="card" fluid color="yellow">
          <Card.Content>
            {this.props.courseData && this.props.courseData.data && this.props.courseData.data.User ? (
              <h2>
                {this.props.courseData.data.User.firsts} {this.props.courseData.data.User.lastname}
              </h2>
            ) : (
              <div />
            )}
            {this.props.courseData && this.props.courseData.data ? <h3> {this.props.courseData.data.projectName} </h3> : <div />}
            {this.props.courseData && this.props.courseData.data ? (
              <h3>
                <a href={this.props.courseData.data.github}>{this.props.courseData.data.github}</a>{' '}
                <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>
                  <Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />
                </Link>
              </h3>
            ) : (
              <div />
            )}
          </Card.Content>
        </Card>
      )
      if (this.props.courseData && this.props.courseData.data && this.props.courseData.data.weeks) {
        let weeks = null


        let i = 0
        for (; i < this.props.courseData.data.weeks.length; i++) {
          weeks = this.props.courseData.data.weeks.find(function(week) {
            return week.weekNumber === i + 1
          })
          if (weeks) {

            headers.push(
              <Accordion key={i} fluid styled>
                <Accordion.Title
                  active={ i === this.props.coursePageLogic.activeIndex }

                  index={i}
                  onClick={this.handleClick}
                >
                  <Icon name="dropdown" /> Week {i + 1}, points {weeks.points}
                </Accordion.Title>
                <Accordion.Content
                  active={ i === this.props.coursePageLogic.activeIndex }>
                  <Card fluid color="yellow">
                    <Card.Content>
                      <h4> Points: {weeks.points} </h4>
                      <h4>
                        {' '}
                        Weekly feedback: <ReactMarkdown>{weeks.feedback}</ReactMarkdown>{' '}
                      </h4>
                    </Card.Content>
                  </Card>
                  <h4> Comments </h4>
                  <Comment.Group>
                    {weeks ? (
                      weeks.comments.map(
                        comment =>
                          comment.hidden ? (
                            <Comment disabled>
                              <Comment.Content>
                                <Comment.Metadata>
                                  <div>Hidden</div>
                                </Comment.Metadata>
                                <Comment.Author>{comment.from}</Comment.Author>
                                <Comment.Text>
                                  {' '}
                                  <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                                </Comment.Text>
                              </Comment.Content>
                            </Comment>
                          ) : (
                            <Comment>
                              <Comment.Author>{comment.from}</Comment.Author>
                              <Comment.Text>
                                {' '}
                                <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                              </Comment.Text>
                            </Comment>
                          )
                      )
                    ) : (
                      <h4> No comments </h4>
                    )}
                  </Comment.Group>
                  <Form reply onSubmit={this.handleSubmit} name={weeks.id} id={weeks.id}>
                    <Form.TextArea name="content" placeholder="Your comment..." defaultValue="" />
                    <Button content="Add Reply" labelPosition="left" icon="edit" primary />
                  </Form>
                </Accordion.Content>
              </Accordion>
            )
          } else {
            headers.push(
              <Accordion key={i} fluid styled>
                <Accordion.Title active={this.props.coursePageLogic.activeIndex === i} index={i} onClick={this.handleClick}>
                  <Icon name="dropdown" /> Week {i + 1}{' '}
                </Accordion.Title>
                <Accordion.Content active={this.props.coursePageLogic.activeIndex === i}>
                  <h4> Not Graded </h4>
                  <h4> No comments </h4>
                </Accordion.Content>
              </Accordion>
            )
          }
        }

        this.props.courseData.data.codeReviews
          .sort((a, b) => {
            return a.reviewNumber - b.reviewNumber
          })
          .forEach(cr => {
            headers.push(
              <Accordion key={i} fluid styled>
                <Accordion.Title className="codeReview" active={this.props.coursePageLogic.activeIndex === i || cr.points === null} index={i} onClick={this.handleClick}>
                  <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? (", points " + cr.points) : ''}
                  
                </Accordion.Title>
                <Accordion.Content active={this.props.coursePageLogic.activeIndex === i || cr.points === null}>
                  <div className="codeReviewExpanded">
                    {cr.points !== null ? 
                      <div>
                        <h4 className="codeReviewPoints">Points: {cr.points}</h4>
                      </div>
                    : (
                      <div>
                        <p>Not Graded</p>
                      </div>
                    )}
                    
                  {this.props.coursePageLogic.showCodeReviews.indexOf(cr.reviewNumber) !== -1 ? (
                      <div>  
                        <h4>Project to review</h4>
                        <p>{cr.toReview.projectName}</p>
                        <p>
                          <a href={cr.toReview.github}>{cr.toReview.github}</a>
                        </p>
                      </div>
                      ) : (
                        <div></div>
                      )
                  }
                  </div>
                </Accordion.Content>
              </Accordion>
            )
            i++
          })
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

    let dropDownTags = []
    dropDownTags = this.createDropdownTags(dropDownTags)

    /**
     * Returns what teachers should see at the top of this page
     */
    let renderTeacherTopPart = () => {
      return (
        <div className="TeachersTopView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <div className="ui grid">
            <div className="sixteen wide column">
              <h2>{this.props.selectedInstance.name}</h2>
            </div>
            {this.props.selectedInstance.active === true ? (
              this.props.courseData.data !== null ? (
                <p />
              ) : (
                <div className="sixteen wide column">
                  <Message compact>
                    <Message.Header>You have not activated this course.</Message.Header>
                  </Message>
                </div>
              )
            ) : (
              <p />
            )}
          </div>
          <div>
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
                        <div />
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
            <List style={{ float: 'right' }}>
              <List.Item icon={{ name: 'edit', color: 'orange' }} content="Edit course" />
            </List>
          </div>
        </div>
      )
    }

    /**
     * Function that returns what teachers should see at the bottom of this page
     */
    let renderTeacherBottomPart = () => {
      return (
        <div className="TeachersBottomView">
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
          </div>

          <Table celled>
            <Table.Header>
              <Table.Row>
              <Table.HeaderCell>
                    Project Info
                    {this.props.coursePageLogic.filterByTag !== 0 ? (
                      <Button compact className="mini ui yellow button" floated="right" onClick={this.changeFilterTag(0)}>
                        Clear tag filter
                      </Button>
                    ) : (
                      <p />
                    )}
                </Table.HeaderCell>
                {createHeadersTeacher()}
                <Table.HeaderCell> Sum </Table.HeaderCell>
                <Table.HeaderCell width="six"> Instructor </Table.HeaderCell>
                <Table.HeaderCell> Review </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData && this.props.courseData.data ? (
                this.props.courseData.data
                  .filter(data => {
                    return this.props.coursePageLogic.filterByAssistant === 0 || this.props.coursePageLogic.filterByAssistant === data.teacherInstanceId
                  })
                  .filter(data => {
                    return this.props.coursePageLogic.filterByTag === 0 || this.hasFilteredTag(data, this.props.coursePageLogic.filterByTag)
                  })
                  .map(data => (
                    <Table.Row key={data.id}>
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>
                        <Table.Cell>
                          <p>
                            {data.projectName}
                            <br />
                            <a href={data.github}>{data.github}</a>
                          </p>
                          {data.Tags.map(tag => (
                            <div key={tag.id}>
                              <Button compact floated="left" className={`mini ui ${tag.color} button`}>
                                {tag.name}
                              </Button>
                            </div>
                          ))}
                        </Table.Cell>
                        <Table.Cell>
                          <br />
                          <Icon id="tag" onClick={this.changeHiddenTagDropdown(data.id)} name="pencil" size="small" style={{ float: 'top' }} />
                          {this.props.coursePageLogic.showTagDropdown === data.id ? (
                            <div>
                              <Dropdown id="tagDropdown" options={dropDownTags} onChange={this.changeSelectedTag()} placeholder="Add tag" fluid selection />
                              <Button onClick={this.addTag(data.id)} size="small">
                                Add tag
                              </Button>
                            </div>
                          ) : (
                            <div />
                          )}
                        </Table.Cell>
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
                        <Popup trigger={<Button circular onClick={this.changeHiddenAssistantDropdown(data.id)} icon={{ name: 'pencil', size: 'medium' }} style={{ float: 'right' }} />} content="Assign instructor" />
                        {this.props.coursePageLogic.showAssistantDropdown === data.id ? (
                          <div>
                            <Dropdown id="assistantDropdown" options={dropDownTeachers} onChange={this.changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
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
                  ))
              ) : (
                <p />
              )}
            </Table.Body>
          </Table>
        </div>
      )
    }

    /**
     * Function that returns what students should see at the top of this page
     */
    let renderStudentTopPart = () => {
      return (
        <div className="StudentsView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <div className="ui grid">
            <div className="sixteen wide column">
              <h2>{this.props.selectedInstance.name}</h2>
            </div>
            {this.props.selectedInstance.active === true ? (
              this.props.courseData.data !== null ? (
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
                    <Popup trigger={<Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />} content="Edit project details" />
                  </Link>
                </div>
              )
            ) : (
              <div className="sixteen wide column">
                <Message compact>
                  <Message.Header>This course has not been activated.</Message.Header>
                </Message>
              </div>
            )}
          </div>
        </div>
      )
    }

    /**
     * This part actually tells what to show to the user
     */
    if (this.props.courseData.role === 'student') {
      return (
        <div key>
          {renderStudentTopPart()}
          {renderStudentBottomPart()}
        </div>
      )
    } else if (this.props.courseData.role === 'teacher') {
      return (
        <div>
          {renderTeacherTopPart()}
          {renderTeacherBottomPart()}
        </div>
      )
    } else {
      return <div />
    }
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
    courseId: ownProps.courseId,
    tags: state.tags
  }
}

const mapDispatchToProps = {
  createOneComment,
  getOneCI,
  coursePageInformation,
  associateTeacherToStudent,
  showAssistantDropdown,
  showTagDropdown,
  selectTeacher,
  selectTag,
  filterByAssistant,
  filterByTag,
  coursePageReset,
  toggleCodeReview,
  getAllTags,
  tagStudent,
  updateActiveIndex
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
