import React, { Component } from 'react'
import { Button, Card, Accordion, Icon, Form, Comment, Input, Popup, Loader, Label } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { gradeCodeReview } from '../../services/codeReview'
import ReactMarkdown from 'react-markdown'
import { sendEmail } from '../../services/email'
import { resetLoading } from '../../reducers/loadingReducer'
import { trimDate, createCourseIdWithYearAndTerm } from '../../util/format'
import { getCoursesByStudentId } from '../../services/studentinstances'

import BackButton from '../BackButton'
import { FormMarkdownTextArea } from '../MarkdownTextArea'

/**
 * Maps all comments from a single instance from coursePage reducer
 */
export class BrowseReviews extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openWeeks: {},
      initialLoading: props.initialLoading !== undefined ? this.props.initialLoading : true
    }
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.getCoursesByStudentId(Number(this.props.studentInstance))
  }

  componentDidMount() {
    if (!this.props.loading.loading && !this.state.openWeeks[this.props.selectedInstance.currentWeek - 1]) {
      this.setState({ openWeeks: { [this.props.selectedInstance.currentWeek - 1]: true } })
    }
  }

  componentDidUpdate() {
    if (!this.props.loading.loading && this.state.initialLoading) {
      this.setState({ initialLoading: false })
    }
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { openWeeks } = this.state
    const numberOfOpen = Object.values(openWeeks).filter(x => x).length

    if (numberOfOpen === 0) {
      // if no reviews open, open the clicked tab
      this.setState({ openWeeks: { [index]: true } })
    } else if (numberOfOpen === 1) {
      // if one open, open the clicked tab and close everything else,
      // or close everything if we clicked the open one
      this.setState({ openWeeks: { [index]: !openWeeks[index] } })
    } else {
      // if multiple open, simply toggle open/close
      this.setState({ openWeeks: { ...openWeeks, [index]: !openWeeks[index] } })
    }
  }

  getMaximumIndexForStudent = student => {
    // how many reviews will there be?
    return this.props.selectedInstance.weekAmount + student.codeReviews.length + 1
  }

  hasAllReviewsOpen = student => {
    return Object.values(this.state.openWeeks).filter(x => x).length == this.getMaximumIndexForStudent(student)
  }

  handleClickShowAll = student => () => {
    const openWeeks = {}
    const maximumIndex = this.getMaximumIndexForStudent(student)
    for (let i = 0; i < maximumIndex; i++) {
      openWeeks[i] = true
    }
    this.setState({ openWeeks })
  }

  handleClickHideAll = () => {
    this.setState({ openWeeks: {} })
  }

  handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: e.target.hidden.checked,
      comment: e.target.content.value,
      week: parseInt(e.target.name, 10)
    }
    document.getElementById(e.target.name).reset()
    try {
      await this.props.createOneComment(content)
    } catch (error) {
      console.log(error)
    }
  }

  sortCommentsByDate = comments => {
    return comments.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }

  gradeCodeReview = (reviewNumber, studentInstanceId) => async e => {
    e.preventDefault()
    const data = {
      reviewNumber,
      studentInstanceId: Number(studentInstanceId),
      points: Number(e.target.points.value)
    }
    this.props.gradeCodeReview(data)
  }

  sendCommentEmail = commentId => async () => {
    this.props.sendEmail({
      commentId,
      role: 'teacher'
    })
  }

  sendWeekEmail = weekId => async () => {
    this.props.sendEmail({
      weekId,
      role: 'teacher'
    })
  }

  isTeacher = () => {
    return this.props.courseData.role === 'teacher'
  }

  //get student's other participations in the same course
  renderStudentPreviousParticipation = () => {
    const previousParticipations = this.props.studentInstanceToBeReviewed.filter(
      courseInstance => courseInstance.ohid.includes(this.props.courseId.substring(0, 8)) && courseInstance.ohid !== this.props.courseId
    )
    if (previousParticipations.length === 0) {
      return <p className="noPrevious">First time to participate the course</p>
    }
    return (
      <div className="hasPrevious">
        <p className style={{ color: 'red' }}>
          Has other participations
        </p>
        {previousParticipations.map(participation => <p key={participation.id}>{createCourseIdWithYearAndTerm(participation.ohid, participation.start)}</p>)}
      </div>
    )
  }

  renderStudentCard = student => (
    <Card key={student.id} fluid color="yellow" className="studentCard">
      <Card.Content>
        <h2>
          {student.User.firsts} {student.User.lastname} ({student.User.studentNumber})
        </h2>
        <h3>
          <a href={`mailto:${student.User.email}`}>{student.User.email}</a>
        </h3>
        <h3>
          {student.projectName}{' '}
          <a href={student.github} target="_blank" rel="noopener noreferrer">
            {student.github}
          </a>
        </h3>
        {this.renderStudentPreviousParticipation()}
      </Card.Content>
    </Card>
  )

  renderComment = isFinalWeek => comment =>
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
          <Comment.Metadata>
            <div>{trimDate(comment.createdAt)}</div>
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
          <div>{trimDate(comment.createdAt)}</div>
        </Comment.Metadata>
        {!isFinalWeek ? (
          <div>
            <div> </div>
            {/* This hack compares user's name to comment.from and hides the email notification button when they don't match. */}
            {comment.from.includes(this.props.user.user.firsts) && comment.from.includes(this.props.user.user.lastname) ? (
              comment.notified ? (
                <Label>
                  Notified <Icon name="check" color="green" />
                </Label>
              ) : (
                <Button type="button" onClick={this.sendCommentEmail(comment.id)} size="small">
                  Send email notification
                </Button>
              )
            ) : (
              <div />
            )}
          </div>
        ) : (
          <div />
        )}
      </Comment>
    )

  renderWeek = (i, week, studentInstance, isFinalWeek) => {
    const { openWeeks } = this.state
    const reviewIndex = isFinalWeek ? this.props.selectedInstance.weekAmount + 1 : i + 1

    if (week) {
      return (
        <Accordion fluid styled>
          <Accordion.Title active={openWeeks[i]} index={i} onClick={this.handleClick}>
            <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}, points {week.points}
          </Accordion.Title>
          <Accordion.Content active={openWeeks[i]}>
            <Card fluid color="yellow">
              <Card.Content>
                <h4> Points {week.points} </h4>
                <h4> Feedback </h4>
                <ReactMarkdown>{week.feedback}</ReactMarkdown>{' '}
                {this.isTeacher() && week.instructorNotes ? (
                  <div>
                    <br />
                    <h4>Review notes for instructors </h4>
                    <ReactMarkdown>{week.instructorNotes}</ReactMarkdown>{' '}
                  </div>
                ) : (
                  <span />
                )}
              </Card.Content>
              {!isFinalWeek ? (
                <Card.Content style={{ paddingBottom: '5px' }}>
                  {week.notified ? (
                    <Label>
                      Notified <Icon name="check" color="green" />
                    </Label>
                  ) : (
                    <Button type="button" onClick={this.sendWeekEmail(week.id)} size="small">
                      Send email notification
                    </Button>
                  )}
                </Card.Content>
              ) : (
                <span />
              )}
            </Card>
            <h4> Comments </h4>
            <Comment.Group>{week ? this.sortCommentsByDate(week.comments).map(this.renderComment(isFinalWeek)) : <h4> No comments </h4>}</Comment.Group>
            <Form reply onSubmit={this.handleSubmit} name={week.id} id={week.id}>
              <FormMarkdownTextArea name="content" placeholder="Your comment..." defaultValue="" />
              <Form.Checkbox label="Add comment for instructors only" name="hidden" />
              <Button content="Add Reply" labelPosition="left" icon="edit" primary />
            </Form>
            <h3>Review</h3>
            <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Edit final review' : 'Edit review'} />
            </Link>
          </Accordion.Content>
        </Accordion>
      )
    } else {
      return (
        <Accordion fluid styled>
          <Accordion.Title active={openWeeks[i]} index={i} onClick={this.handleClick}>
            <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}{' '}
          </Accordion.Title>
          <Accordion.Content active={openWeeks[i]}>
            <h4> Not Graded </h4>
            <h4> No comments </h4>
            <Link to={`/labtool/reviewstudent/${this.props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Give Final Review' : 'Review week'} />
            </Link>
          </Accordion.Content>
        </Accordion>
      )
    }
  }

  renderCodeReview = (i, cr, studentInstance) => {
    const { openWeeks } = this.state

    return (
      <Accordion fluid styled>
        {' '}
        <Accordion.Title active={openWeeks[i]} index={i} onClick={this.handleClick}>
          <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
        </Accordion.Title>
        <Accordion.Content active={openWeeks[i]}>
          <p>
            <strong>Project to review:</strong> {this.props.courseData.data.find(data => data.id === cr.toReview).projectName} <br />
            <strong>GitHub:</strong>{' '}
            <a href={this.props.courseData.data.find(data => data.id === cr.toReview).github} target="_blank" rel="noopener noreferrer">
              {this.props.courseData.data.find(data => data.id === cr.toReview).github}
            </a>
          </p>
          <strong>Code review:</strong>{' '}
          {cr.linkToReview ? (
            <a href={cr.linkToReview} target="_blank" rel="noopener noreferrer">
              {cr.linkToReview}
            </a>
          ) : (
            'No review linked yet'
          )}
          {cr.points !== null ? <h4>{cr.points} points</h4> : <h4>Not graded yet</h4>}
          <Form onSubmit={this.gradeCodeReview(cr.reviewNumber, studentInstance)}>
            <label>Points </label>
            <Input name="points" defaultValue={cr.points ? cr.points : ''} type="number" step="0.01" style={{ width: '100px' }} />
            <Input type="submit" value="Grade" />
          </Form>
        </Accordion.Content>
      </Accordion>
    )
  }

  render() {
    if (this.state.initialLoading) {
      return <Loader active />
    }

    const createHeaders = (studhead, studentInstance) => {
      let headers = []
      studhead.data.map(student => {
        // studentInstance is id of student. Type: String
        // Tämä pitää myös korjata.
        if (student.id === Number(studentInstance)) {
          headers.push(this.renderStudentCard(student))
          headers.push(
            <span>
              {this.hasAllReviewsOpen(student) ? (
                <Button type="button" onClick={this.handleClickHideAll} size="small">
                  Hide all reviews
                </Button>
              ) : (
                <Button type="button" onClick={this.handleClickShowAll(student)} size="small">
                  Show all reviews
                </Button>
              )}
              <br />
            </span>
          )
          let i = 0
          let ii = 0
          for (; i < this.props.selectedInstance.weekAmount; i++) {
            const weeks = student.weeks.find(week => week.weekNumber === i + 1)
            headers.push(this.renderWeek(i, weeks, studentInstance, false))
          }
          student.codeReviews
            .sort((a, b) => {
              return a.reviewNumber - b.reviewNumber
            })
            .forEach(cr => {
              headers.push(this.renderCodeReview(i + ii + 1, cr, studentInstance))
              ii++
            })
          if (this.props.selectedInstance.finalReview) {
            const finalWeek = student.weeks.find(week => week.weekNumber === this.props.selectedInstance.weekAmount + 1)
            headers.push(this.renderWeek(i + ii, finalWeek, studentInstance, true))
          }
        }
        return student
      })
      return headers.map((header, index) => React.cloneElement(header, { key: index }))
    }

    return (
      <div className="BrowseReviews" style={{ overflowX: 'auto' }}>
        <Loader active={this.props.loading.loading} />
        {this.isTeacher() ? (
          <div>
            <BackButton preset="coursePage" />
            <Link to={`/labtool/courses/${this.props.selectedInstance.ohid}`} style={{ textAlign: 'center' }}>
              <h2> {this.props.selectedInstance.name} </h2>
            </Link>
            {createHeaders(this.props.courseData, this.props.studentInstance)}
          </div>
        ) : (
          <p />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    user: state.user,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage,
    studentInstanceToBeReviewed: state.studentInstance,
    loading: state.loading
  }
}

const mapDispatchToProps = {
  createOneComment,
  getOneCI,
  coursePageInformation,
  gradeCodeReview,
  sendEmail,
  getCoursesByStudentId: getCoursesByStudentId,
  resetLoading
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BrowseReviews)
