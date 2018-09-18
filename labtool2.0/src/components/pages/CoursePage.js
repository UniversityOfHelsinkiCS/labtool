import React from 'react'
import { Accordion, Button, Table, Card, Input, Form, Comment, Header, Label, Message, Icon, Dropdown, Popup, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { associateTeacherToStudent } from '../../services/assistant'
import ReactMarkdown from 'react-markdown'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { addLinkToCodeReview } from '../../services/codeReview'
import { sendEmail } from '../../services/email'
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
import { resetLoading } from '../../reducers/loadingReducer'

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
      document.getElementById('comment').reset()
    } catch (error) {
      console.log(error)
    }
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.getAllTags()
  }

  componentWillUnmount() {
    this.props.coursePageReset()
  }

  sortArrayAscendingByDate = theArray => {
    return theArray.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }

  trimDate = date => {
    return new Date(date)
      .toLocaleString()
      .replace('/', '.')
      .replace('/', '.')
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

  removeTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: this.props.coursePageLogic.selectedTag
      }
      await this.props.unTagStudent(data)
    } catch (error) {
      console.log(error)
    }
  }

  handleAddingIssueLink = (reviewNumber, studentInstance) => async e => {
    e.preventDefault()
    const data = {
      reviewNumber,
      studentInstanceId: studentInstance,
      linkToReview: e.target.reviewLink.value
    }
    e.target.reviewLink.value = ''
    this.props.addLinkToCodeReview(data)
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
    let hasRequiredTags = true
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (!studentInstanceTagIds.includes(filteringTagIds[i])) {
        hasRequiredTags = false
      }
    }
    return hasRequiredTags
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
    if (this.props.tags.tags !== undefined) {
      this.props.tags.tags.map(tag =>
        array.push({
          key: tag.id,
          text: tag.name,
          value: tag.id
        })
      )
      return array
    }
    return []
  }

  sendEmail = commentId => async e => {
    this.props.sendEmail({
      commentId,
      role: 'student'
    })
  }

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }
    const numberOfCodeReviews = Array.isArray(this.props.courseData.data) ? Math.max(...this.props.courseData.data.map(student => student.codeReviews.length)) : 0

    const createIndents = (weeks, codeReviews, siId) => {
      const cr = codeReviews &&
        codeReviews.reduce((a, b) => {
          return { ...a, [b.reviewNumber]: b.points }
        }, {})
      const indents = []
      let i = 0
      let finalPoints = undefined
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
          } else if (weeks[j].weekNumber === this.props.selectedInstance.weekAmount + 1) {
            finalPoints = weeks[j].points
          }
        }
        indents.push(pushattava)
      }

      let ii = 0
      const { amountOfCodeReviews } = this.props.selectedInstance
      if (amountOfCodeReviews) {
        for (let index = 1; index <= amountOfCodeReviews; index++) {
          indents.push(<Table.Cell key={siId + index}>{cr[index] || cr[index] === 0 ? <p className="codeReviewPoints">{cr[index]}</p> : <p>-</p>}</Table.Cell>)
        }
      }
      // codeReviews.forEach(cr => {
      //   indents.push(<Table.Cell key={i + ii}>{cr.points !== null ? <p className="codeReviewPoints">{cr.points}</p> : <p>-</p>}</Table.Cell>)
      //   ii++
      // // })
      // while (ii < numberOfCodeReviews) {
      //   indents.push(
      //     <Table.Cell key={i + ii}>
      //       <p>-</p>
      //     </Table.Cell>
      //   )
      //   ii++
      // }

      if (this.props.selectedInstance.finalReview) {
        let finalReviewPointsCell = (
          <Table.Cell key={i + ii + 1}>
            <p>{finalPoints === undefined ? '-' : finalPoints}</p>
          </Table.Cell>
        )
        indents.push(finalReviewPointsCell)
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
      for (var ii = 1; ii <= this.props.selectedInstance.amountOfCodeReviews; ii++) {
        headers.push(<Table.HeaderCell key={i + ii}>Code Review {ii} </Table.HeaderCell>)
      }
      if (this.props.selectedInstance.finalReview) {
        headers.push(<Table.HeaderCell key={i + ii + 1}>Final Review </Table.HeaderCell>)
      }
      return headers
    }

    const renderStudentBottomPart = () => {
      let headers = []
      // studentInstance is id of student. Type: String
      // Tämä pitää myös korjata.
      headers.push(
        <div key="student info">
          {this.props.courseData && this.props.courseData.data && this.props.courseData.data.User ? (
            <Card key="card" fluid color="yellow">
              <Card.Content>
                <h2>
                  {this.props.courseData.data.User.firsts} {this.props.courseData.data.User.lastname}
                </h2>
                <h3> {this.props.courseData.data.projectName} </h3>
                <h3>
                  <a href={this.props.courseData.data.github}>{this.props.courseData.data.github}</a>{' '}
                  <Link to={`/labtool/courseregistration/${this.props.selectedInstance.ohid}`}>
                    <Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />
                  </Link>
                </h3>
              </Card.Content>
            </Card>
          ) : (
            <div />
          )}
        </div>
      )
      if (this.props.selectedInstance && this.props.courseData && this.props.courseData.data && this.props.courseData.data.weeks) {
        let i = 0
        let week = null
        const howManyWeeks = this.props.selectedInstance.finalReview ? this.props.selectedInstance.weekAmount + 1 : this.props.selectedInstance.weekAmount
        for (; i < howManyWeeks; i++) {
          week = this.props.courseData.data.weeks.find(week => week.weekNumber === i + 1)
          if (week !== undefined) {
            headers.push(
              <Accordion key={i} fluid styled>
                <Accordion.Title active={i === this.props.coursePageLogic.activeIndex} index={i} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  {i + 1 > this.props.selectedInstance.weekAmount ? <span>Final Review</span> : <span>Week {week.weekNumber}</span>}, points {week.points}
                </Accordion.Title>
                <Accordion.Content active={i === this.props.coursePageLogic.activeIndex}>
                  <Card fluid color="yellow">
                    <Card.Content>
                      <h4> Points {week.points} </h4>
                      <h4> Feedback </h4>
                      <ReactMarkdown>{week.feedback}</ReactMarkdown>{' '}
                    </Card.Content>
                  </Card>
                  <h4> Comments </h4>
                  <Comment.Group>
                    {week ? (
                      this.sortArrayAscendingByDate(week.comments).map(
                        comment =>
                          comment.hidden ? (
                            <Comment key={comment.id} disabled>
                              <Comment.Content>
                                <Comment.Metadata>
                                  <div>Hidden</div>
                                </Comment.Metadata>
                                <Comment.Author>{comment.from}</Comment.Author>
                                <Comment.Text>
                                  {' '}
                                  <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                                </Comment.Text>
                                <Comment.Metadata>
                                  <div>{this.trimDate(comment.createdAt)}</div>
                                </Comment.Metadata>
                                <div> </div>
                              </Comment.Content>
                            </Comment>
                          ) : (
                            <Comment key={comment.id}>
                              <Comment.Author>{comment.from}</Comment.Author>
                              <Comment.Text>
                                {' '}
                                <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
                              </Comment.Text>
                              <Comment.Metadata>
                                <div>{this.trimDate(comment.createdAt)}</div>
                              </Comment.Metadata>
                              <div> </div>
                              {/* This hack compares user's name to comment.from and hides the email notification button when they don't match. */}
                              {comment.from.includes(this.props.user.user.lastname) ? (
                                comment.notified ? (
                                  <Label>
                                    Notified <Icon name="check" color="green" />
                                  </Label>
                                ) : (
                                  <Button type="button" onClick={this.sendEmail(comment.id)} size="small">
                                    Send email notification
                                  </Button>
                                )
                              ) : (
                                <div />
                              )}
                            </Comment>
                          )
                      )
                    ) : (
                      <h4> No comments </h4>
                    )}
                  </Comment.Group>
                  <Form reply onSubmit={this.handleSubmit} name={week.id} id={week.id}>
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
                  <Icon name="dropdown" /> {i + 1 > this.props.selectedInstance.weekAmount ? <span>Final Review</span> : <span>Week {i + 1}</span>}
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
                  <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
                </Accordion.Title>
                <Accordion.Content active={this.props.coursePageLogic.activeIndex === i || cr.points === null}>
                  <div className="codeReviewExpanded">
                    <div className="codeReviewPoints">
                      <strong>Points: </strong> {cr.points !== null ? cr.points : 'Not graded yet'}
                      <br /> <br />
                      <strong>Project to review: </strong>
                      {cr.toReview.projectName}
                      <br />
                      <strong>Github: </strong>
                      <a href={cr.toReview.github}>{cr.toReview.github}</a>
                      <br /> <br />
                      {cr.linkToReview ? (
                        <div>
                          <strong>Your review: </strong> <a href={cr.linkToReview}>{cr.linkToReview}</a>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>

                    {this.props.coursePageLogic.showCodeReviews.indexOf(cr.reviewNumber) !== -1 ? (
                      <div>
                        {cr.linkToReview ? (
                          <div />
                        ) : (
                          <div>
                            <strong>Link your review here:</strong> <br />
                            <Form onSubmit={this.handleAddingIssueLink(cr.reviewNumber, this.props.courseData.data.id)}>
                              <Form.Group inline>
                                <Input
                                  type="text"
                                  name="reviewLink"
                                  icon="github"
                                  required="true"
                                  iconPosition="left"
                                  style={{ minWidth: '25em' }}
                                  placeholder="https://github.com/account/repo/issues/number"
                                  className="form-control1"
                                />
                              </Form.Group>
                              <Form.Group>
                                <Button compact type="submit" color="blue">
                                  Submit
                                </Button>
                              </Form.Group>
                            </Form>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p />
                    )}
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
            {this.props.courseInstance && this.props.courseInstance.active === true ? (
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
            <span> Tag filters: </span>
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
                <Table.HeaderCell key={-1}>Student</Table.HeaderCell>
                <Table.HeaderCell>Project Info</Table.HeaderCell>
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
                    return this.props.coursePageLogic.filterByTag.length === 0 || this.hasFilteringTags(data.Tags, this.props.coursePageLogic.filterByTag)
                  })
                  .map(data => (
                    <Table.Row key={data.id}>
                      <Table.Cell>
                        {data.User.firsts} {data.User.lastname}
                      </Table.Cell>
                      <Table.Cell>
                        <span>
                          {data.projectName}
                          <br />
                          <a href={data.github}>{data.github}</a>
                          {data.Tags.map(tag => (
                            <div key={tag.id}>
                              <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                                {tag.name}
                              </Button>
                            </div>
                          ))}
                          <Popup
                            trigger={<Icon id="tag" onClick={this.changeHiddenTagDropdown(data.id)} name="pencil" size="large" color="green" style={{ float: 'right' }} />}
                            content="Add or remove tag"
                          />
                        </span>
                        <div>
                          {this.props.coursePageLogic.showTagDropdown === data.id ? (
                            <div>
                              <Dropdown id="tagDropdown" style={{ float: 'left' }} options={dropDownTags} onChange={this.changeSelectedTag()} placeholder="Choose tag" fluid selection />
                              <div className="two ui buttons">
                                <button className="ui icon positive button" onClick={this.addTag(data.id)} size="mini">
                                  <i className="plus icon" />
                                </button>
                                <div className="or" />
                                <button className="ui icon button" onClick={this.removeTag(data.id)} size="mini">
                                  <i className="trash icon" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div />
                          )}
                        </div>
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
                        <Popup trigger={<Button circular onClick={this.changeHiddenAssistantDropdown(data.id)} icon={{ name: 'pencil' }} style={{ float: 'right' }} />} content="Assign instructor" />
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
    courseInstance: state.courseInstance,
    courseData: state.coursePage,
    coursePageLogic: state.coursePageLogic,
    courseId: ownProps.courseId,
    tags: state.tags,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createOneComment,
  getOneCI,
  coursePageInformation,
  associateTeacherToStudent,
  addLinkToCodeReview,
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
  sendEmail,
  updateActiveIndex,
  unTagStudent,
  resetLoading
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
