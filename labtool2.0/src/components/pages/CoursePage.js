import React from 'react'
import { Accordion, Button, Table, Card, Input, Form, Comment, Header, Label, Message, Icon, Popup, Loader } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import ReactMarkdown from 'react-markdown'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { addLinkToCodeReview } from '../../services/codeReview'
import { sendEmail } from '../../services/email'
import { coursePageReset, updateActiveIndex, toggleCodeReview } from '../../reducers/coursePageLogicReducer'
import { resetLoading } from '../../reducers/loadingReducer'

import { LabtoolComment } from '../LabtoolComment'
import { FormMarkdownTextArea } from '../MarkdownTextArea'
import StudentTable from '../StudentTable'

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

  droppedTagExists = () => {
    return this.props.tags.tags && this.props.tags.tags.map(tag => tag.name.toUpperCase()).includes('DROPPED')
  }

  hasDroppedTag = studentTagsData => {
    let studentInstanceTagNames = studentTagsData.map(tag => tag.name.toUpperCase())
    return studentInstanceTagNames.includes('DROPPED')
  }

  markAllWithDroppedTagAsDropped = async courseData => {
    if (
      !window.confirm(
        'Confirming will mark the students with a dropped tag as dropped out. If a different tag was being used, the system will not suggest an automatic change. In that case, you need to change the status manually in the review page of that student. Are you sure you want to confirm?'
      )
    ) {
      return
    }
    for (let i = 0; i < courseData.data.length; i++) {
      let student = courseData.data[i]
      let studentTags = student.Tags
      if (this.hasDroppedTag(studentTags) === true) {
        this.handleMarkAsDropped(true, student.User.id)
      }
    }
  }

  handleMarkAsDropped = async (dropped, id) => {
    this.props.updateStudentProjectInfo({
      ohid: this.props.selectedInstance.ohid,
      userId: id,
      dropped: dropped
    })
  }

  sendEmail = commentId => async () => {
    this.props.sendEmail({
      commentId,
      role: 'student'
    })
  }

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }

    const renderComment = comment => {
      /* This hack compares user's name to comment.from and hides the email notification button when they don't match. */
      const userIsCommandSender = comment.from.includes(this.props.user.user.firsts) && comment.from.includes(this.props.user.user.lastname)

      return <LabtoolComment key={comment.id} comment={comment} allowNotify={userIsCommandSender} sendCommentEmail={this.sendEmail(comment.id)} />
    }

    const createStudentGradedWeek = (i, week) => (
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
          <Comment.Group>{week ? this.sortArrayAscendingByDate(week.comments).map(renderComment) : <h4> No comments </h4>}</Comment.Group>
          <Form reply onSubmit={this.handleSubmit} name={week.id} id={week.id}>
            <FormMarkdownTextArea name="content" placeholder="Your comment..." defaultValue="" />
            <Button content="Add Reply" labelPosition="left" icon="edit" primary />
          </Form>
        </Accordion.Content>
      </Accordion>
    )

    const createStudentUngradedWeek = i => (
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

    const createStudentCodeReview = (i, cr) => (
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
              <strong>GitHub: </strong>
              <a href={cr.toReview.github} target="_blank" rel="noopener noreferrer">
                {cr.toReview.github}
              </a>
              <br /> <br />
              {cr.linkToReview ? (
                <div>
                  <strong>Your review: </strong>
                  <a href={cr.linkToReview} target="_blank" rel="noopener noreferrer">
                    {cr.linkToReview}
                  </a>
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

    const renderStudentBottomPart = () => {
      let headers = []
      // studentInstance is id of student. Type: String
      // Tämä pitää myös korjata.

      // student's own details.
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
                  <a href={this.props.courseData.data.github} target="_blank" rel="noopener noreferrer">
                    {this.props.courseData.data.github}
                  </a>{' '}
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

      // student's week and code reviews
      if (this.props.selectedInstance && this.props.courseData && this.props.courseData.data && this.props.courseData.data.weeks) {
        let i = 0
        let week = null
        const weekMatcher = i => week => week.weekNumber === i + 1

        const howManyWeeks = this.props.selectedInstance.finalReview ? this.props.selectedInstance.weekAmount + 1 : this.props.selectedInstance.weekAmount
        for (; i < howManyWeeks; i++) {
          week = this.props.courseData.data.weeks.find(weekMatcher(i))
          headers.push(week !== undefined ? createStudentGradedWeek(i, week) : createStudentUngradedWeek(i))
        }

        this.props.courseData.data.codeReviews
          .sort((a, b) => {
            return a.reviewNumber - b.reviewNumber
          })
          .forEach(cr => {
            headers.push(createStudentCodeReview(i, cr))
            i++
          })

        headers.push(
          <Accordion key="total" fluid styled style={{ marginBottom: '2em' }}>
            <Accordion.Title active={true} index="total">
              <Icon name="check" />
              <strong> Total Points: </strong>
              {(
                this.props.courseData.data.weeks.map(week => week.points).reduce((a, b) => {
                  return a + b
                }, 0) +
                this.props.courseData.data.codeReviews.map(cr => cr.points).reduce((a, b) => {
                  return a + b
                }, 0)
              )
                .toFixed(2)
                .replace(/[.,]00$/, '')}
            </Accordion.Title>
          </Accordion>
        )
      }

      return headers
    }

    /**
     * Returns what teachers should see at the top of this page
     */
    let renderTeacherTopPart = () => {
      return (
        <div className="TeachersTopView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
          <div>
            <div>
              <h2>{this.props.selectedInstance.name}</h2>
            </div>
            {this.props.courseInstance && this.props.courseInstance.active !== true ? (
              !this.props.selectedInstance.active && (
                <div>
                  <Message compact>
                    <Message.Header>You have not activated this course.</Message.Header>
                  </Message>
                  <br />
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
                          Active registration
                        </Label>
                      ) : (
                        <div />
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>Week amount: {this.props.selectedInstance.weekAmount}</Table.Cell>
                  <Table.Cell>Current week: {this.props.selectedInstance.currentWeek}</Table.Cell>
                  <Table.Cell>Week max points: {this.props.selectedInstance.weekMaxPoints}</Table.Cell>
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

    let renderTeacherBottomPartForStudents = droppedOut => {
      const heading = droppedOut ? 'Dropped out students' : 'Students'
      const tableClassName = droppedOut ? 'TeachersBottomViewForDroppedOutStudents' : 'TeachersBottomViewForActiveStudents'
      const rowClassName = droppedOut ? 'TableRowForDroppedOutStudents' : 'TableRowForActiveStudents'
      const dropConvertButton = !droppedOut &&
        this.droppedTagExists() && (
          <Button onClick={() => this.markAllWithDroppedTagAsDropped(this.props.courseData)} size="small">
            Mark all with dropped tag as dropped out
          </Button>
        )
      return (
        <div className={tableClassName}>
          <Header as="h2">{heading} </Header>

          <StudentTable
            rowClassName={rowClassName + (droppedOut ? ' active' : '')}
            columns={['points', 'review']}
            allowModify={true}
            filterStudents={data => droppedOut === data.dropped}
            disableDefaultFilter={droppedOut}
            selectedInstance={this.props.selectedInstance}
            courseData={this.props.courseData}
            coursePageLogic={this.props.coursePageLogic}
            tags={this.props.tags}
          />
          <br />
          {dropConvertButton}

          <Link to={`/labtool/massemail/${this.props.selectedInstance.ohid}`}>
            <Button size="small">Send email to multiple students</Button>
          </Link>
          <br />
          <br />
        </div>
      )
    }

    /**
     * Function that returns what teachers should see at the bottom of this page
     */
    let renderTeacherBottomPartForActiveStudents = () => {
      return renderTeacherBottomPartForStudents(false)
    }

    let renderTeacherBottomPartForDroppedOutStudents = () => {
      return renderTeacherBottomPartForStudents(true)
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
        <div style={{ overflow: 'auto' }}>
          {renderTeacherTopPart()}
          {renderTeacherBottomPartForActiveStudents()}
          {renderTeacherBottomPartForDroppedOutStudents()}
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
  addLinkToCodeReview,
  coursePageReset,
  toggleCodeReview,
  getAllTags,
  tagStudent,
  sendEmail,
  updateActiveIndex,
  unTagStudent,
  resetLoading,
  updateStudentProjectInfo
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
