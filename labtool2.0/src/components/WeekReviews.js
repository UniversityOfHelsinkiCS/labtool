import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Accordion, Card, Comment, Form, Input, Button, Label, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { LabtoolAddComment } from './LabtoolAddComment'
import ReactMarkdown from 'react-markdown'
import { LabtoolComment } from './LabtoolComment'
import { createOneComment } from '../services/comment'
import { getOneCI, coursePageInformation } from '../services/courseInstance'
import { associateTeacherToStudent } from '../services/assistant'
import { addLinkToCodeReview } from '../services/codeReview'
import { sendEmail } from '../services/email'
import { coursePageReset, updateActiveIndex, toggleCodeReview, selectTag, selectTeacher } from '../reducers/coursePageLogicReducer'
import { resetLoading } from '../reducers/loadingReducer'
import useLegacyState from '../hooks/legacyState'

export const WeekReviews = props => {
  const state = useLegacyState({
    openWeeks: {}
  })

  useEffect(() => {
    if (!props.openWeeks && !Object.keys(state.openWeeks).length && !state.openWeeks[props.selectedInstance.currentWeek - 1]) {
      state.openWeeks = { [props.selectedInstance.currentWeek - 1]: true }
    }
  }, [])

  const isTeacher = () => {
    return props.courseData.role === 'teacher'
  }

  const sortCommentsByDate = comments => {
    return comments.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }

  const gradeCodeReview = (reviewNumber, studentInstanceId) => async e => {
    e.preventDefault()
    const data = {
      reviewNumber,
      studentInstanceId: Number(studentInstanceId),
      points: Number(e.target.points.value)
    }
    props.gradeCodeReview(data)
  }

  const renderComment = (isFinalWeek, comment) => {
    /* This hack compares user's name to comment.from and hides the email notification button when they don't match. */
    const userIsCommandSender = comment.from.includes(props.user.user.firsts) && comment.from.includes(props.user.user.lastname)

    return <LabtoolComment key={comment.id} comment={comment} allowNotify={!isFinalWeek && userIsCommandSender} sendCommentEmail={(isTeacher ? sendCommentEmail : sendStudentEmail)(comment.id)} />
  }

  const getMaximumPoints = week => {
    const checklist = props.selectedInstance.checklists.find(checkl => checkl.week === week)
    if (checklist === undefined || checklist.maxPoints === 0 || checklist.maxPoints === null) {
      return props.selectedInstance.weekMaxPoints
    }
    return checklist.maxPoints
  }

  const sendCommentEmail = commentId => async () => {
    props.sendEmail({
      commentId,
      role: 'teacher'
    })
  }

  const sendWeekEmail = weekId => async () => {
    props.sendEmail({
      weekId,
      role: 'teacher'
    })
  }

  const sendStudentEmail = commentId => async () => {
    props.sendEmail({
      commentId,
      role: 'student'
    })
  }

  const handleClickNative = (e, titleProps) => {
    const { index } = titleProps
    const openWeeks = state.openWeeks
    const numberOfOpen = Object.values(openWeeks).filter(x => x).length

    if (numberOfOpen === 0) {
      // if no reviews open, open the clicked tab
      state.openWeeks = { [index]: true }
    } else if (numberOfOpen === 1) {
      // if one open, open the clicked tab and close everything else,
      // or close everything if we clicked the open one
      state.openWeeks = { [index]: !openWeeks[index] }
    } else {
      // if multiple open, simply toggle open/close
      state.openWeeks = { ...openWeeks, [index]: !openWeeks[index] }
    }
  }
  const handleClick = props.handleClickWeek || handleClickNative

  const handleAddingIssueLink = (reviewNumber, studentInstance) => async e => {
    e.preventDefault()
    const data = {
      reviewNumber,
      studentInstanceId: studentInstance,
      linkToReview: e.target.reviewLink.value
    }
    e.target.reviewLink.value = ''
    props.addLinkToCodeReview(data)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: isTeacher() ? e.target.hidden.checked : false,
      comment: e.target.content.value,
      from: props.user.user.username,
      week: parseInt(e.target.name, 10)
    }
    console.log(content)
    document.getElementById(e.target.name).reset()
    try {
      await props.createOneComment(content)
    } catch (error) {
      console.error(error)
    }
  }

  const renderGradedWeek = (i, week, studentInstance, isFinalWeek, reviewIndex, isWeekOpen) => (
    <Accordion fluid styled id={`review${i}`}>
      <Accordion.Title active={isWeekOpen} index={i + (isFinalWeek && isTeacher() ? 1 : 0)} onClick={handleClick}>
        <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${week.weekNumber}`}, points {week.points} / {getMaximumPoints(week.weekNumber)}
      </Accordion.Title>
      <Accordion.Content active={isWeekOpen}>
        <h3>Review</h3>
        <Card fluid color="yellow">
          <Card.Content>
            <h4>
              {' '}
              Points {week.points} / {getMaximumPoints(week.weekNumber)}{' '}
            </h4>
            <h4> Feedback </h4>
            <ReactMarkdown>{week.feedback}</ReactMarkdown>{' '}
            {isTeacher() && week.instructorNotes ? (
              <div>
                <br />
                <h4>Review notes for instructors </h4>
                <ReactMarkdown>{week.instructorNotes}</ReactMarkdown>{' '}
              </div>
            ) : (
              <span />
            )}
          </Card.Content>
          {isTeacher() && !isFinalWeek ? (
            <Card.Content style={{ paddingBottom: '5px' }}>
              {week.notified ? (
                <Label>
                  Notified <Icon name="check" color="green" />
                </Label>
              ) : (
                <Button type="button" onClick={sendWeekEmail(week.id)} size="small">
                  Send email notification
                </Button>
              )}
            </Card.Content>
          ) : (
            <span />
          )}
        </Card>
        {isTeacher() && (
          <Link to={`/labtool/reviewstudent/${props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
            <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Edit final review' : 'Edit review'} />
          </Link>
        )}
        {week.comments.length === 0 ? null : <h4> Comments </h4>}
        <Comment.Group>{week ? sortCommentsByDate(week.comments).map(c => renderComment(isFinalWeek, c)) : <h4> No comments </h4>}</Comment.Group>
        <LabtoolAddComment weekId={week.id} commentFieldId={`${props.courseId}:${week.id}`} handleSubmit={handleSubmit} allowHidden={isTeacher()} />
      </Accordion.Content>
    </Accordion>
  )

  const renderUngradedWeek = (i, studentInstance, isFinalWeek, reviewIndex, isWeekOpen) => (
    <Accordion fluid styled id={`review${i}`}>
      <Accordion.Title active={isWeekOpen} index={i} onClick={handleClick}>
        <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}{' '}
      </Accordion.Title>
      <Accordion.Content active={isWeekOpen}>
        {isTeacher() && (
          <>
            <h3>Review</h3>
            <Link to={`/labtool/reviewstudent/${props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Give Final Review' : 'Review week'} />
            </Link>
          </>
        )}
        <h4> Not Graded </h4>
        <h4> No comments </h4>
      </Accordion.Content>
    </Accordion>
  )

  const renderWeek = (i, week, studentInstance, isFinalWeek) => {
    const openWeeks = props.openWeeks || state.openWeeks
    const reviewIndex = isFinalWeek ? props.selectedInstance.weekAmount + 1 : i + 1
    const isWeekOpen = openWeeks[i + (isFinalWeek && isTeacher() ? 1 : 0)]

    return week ? renderGradedWeek(i, week, studentInstance, isFinalWeek, reviewIndex, isWeekOpen) : renderUngradedWeek(i, studentInstance, isFinalWeek, reviewIndex, isWeekOpen)
  }

  // render link of the repo which is assigned to the student to review
  const renderAssignedCodeReviewLink = cr => {
    if (cr.toReview) {
      return (
        <p>
          <strong>Project to review:</strong> {props.courseData.data.find(data => data.id === cr.toReview).projectName} <br />
          <strong>GitHub:</strong>{' '}
          <a href={props.courseData.data.find(data => data.id === cr.toReview).github} target="_blank" rel="noopener noreferrer">
            {props.courseData.data.find(data => data.id === cr.toReview).github}
          </a>
        </p>
      )
    }
    return (
      <p>
        <span>This student is assigned a repo that doesn&#39;t belong to this course to review</span>
        <br />
        <strong>GitHub:</strong>{' '}
        <a href={cr.repoToReview} target="_blank" rel="noopener noreferrer">
          {cr.repoToReview}
        </a>
      </p>
    )
  }

  const renderCodeReviewTeacher = (cr, studentInstance) => (
    <>
      {renderAssignedCodeReviewLink(cr)}
      <strong>Code review:</strong>{' '}
      {cr.linkToReview ? (
        <a href={cr.linkToReview} target="_blank" rel="noopener noreferrer">
          {cr.linkToReview}
        </a>
      ) : (
        'No review linked yet'
      )}
      {cr.points !== null ? <h4>{cr.points} points</h4> : <h4>Not graded yet</h4>}
      <Form onSubmit={gradeCodeReview(cr.reviewNumber, studentInstance)}>
        <label>Points </label>
        <Input name="points" defaultValue={cr.points ? cr.points : ''} type="number" step="0.01" style={{ width: '100px' }} />
        <Input type="submit" value="Grade" />
      </Form>
    </>
  )

  const renderCodeReviewStudent = cr => (
    <>
      <strong>Points: </strong> {cr.points !== null ? cr.points : 'Not graded yet'}
      <br />
      <strong>GitHub: </strong>
      <a href={cr.toReview.github || cr.repoToReview} target="_blank" rel="noopener noreferrer">
        {cr.toReview.github || cr.repoToReview}
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
      {props.coursePageLogic.showCodeReviews.indexOf(cr.reviewNumber) !== -1 ? (
        <div>
          {cr.linkToReview ? (
            <div />
          ) : (
            <div>
              <strong>Link your review here:</strong> <br />
              <Form onSubmit={handleAddingIssueLink(cr.reviewNumber, props.courseData.data.id)}>
                <Form.Group inline>
                  <Input
                    type="text"
                    name="reviewLink"
                    icon="github"
                    required={true}
                    iconPosition="left"
                    style={{ minWidth: '25em' }}
                    placeholder="https://github.com/account/repo/issues/number"
                    className="form-control1"
                  />
                </Form.Group>
                <Form.Group>
                  <Button compact type="submit" color="blue" style={{ marginLeft: '0.5em' }}>
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
    </>
  )

  const renderCodeReview = (i, cr, studentInstance) => {
    const openWeeks = props.openWeeks || state.openWeeks
    const doOpen = openWeeks[i] || (!isTeacher() && cr.points === null)

    return (
      <Accordion key={`codereview${i}`} fluid styled id={`review${i - 1}`}>
        {' '}
        <Accordion.Title className="codeReview" active={doOpen} index={i} onClick={handleClick}>
          <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
        </Accordion.Title>
        <Accordion.Content active={doOpen}>{isTeacher() ? renderCodeReviewTeacher(cr, studentInstance) : renderCodeReviewStudent(cr)}</Accordion.Content>
      </Accordion>
    )
  }

  const weekMatcher = i => week => week.weekNumber === i + 1
  const weekAmount = props.selectedInstance.weekAmount

  const normalWeeks = []
  for (let i = 0; i < weekAmount; ++i) {
    normalWeeks.push(renderWeek(i, props.student.weeks.find(weekMatcher(i)), props.studentInstance, false))
  }

  const codeReviews = props.student.codeReviews
    .sort((a, b) => {
      return a.reviewNumber - b.reviewNumber
    })
    .map((cr, indx) => renderCodeReview(weekAmount + indx + 1, cr, props.studentInstance))

  const finalReview = []
  if (props.selectedInstance.finalReview) {
    finalReview.push(renderWeek(weekAmount + codeReviews.length, props.student.weeks.find(weekMatcher(weekAmount)), props.studentInstance, true))
  }

  let weeks
  if (isTeacher()) {
    weeks = []
      .concat(normalWeeks)
      .concat(codeReviews)
      .concat(finalReview)
  } else {
    weeks = []
      .concat(normalWeeks)
      .concat(finalReview)
      .concat(codeReviews)

    /* total points */
    weeks.push(
      <Accordion key="total" fluid styled style={{ marginBottom: '2em' }}>
        <Accordion.Title active={true} index="total">
          <Icon name="check" />
          <strong> Total Points: </strong>
          {(
            props.student.weeks
              .map(week => week.points)
              .reduce((a, b) => {
                return a + b
              }, 0) +
            props.student.codeReviews
              .map(cr => cr.points)
              .reduce((a, b) => {
                return a + b
              }, 0)
          )
            .toFixed(2)
            .replace(/[.,]00$/, '')}
        </Accordion.Title>
      </Accordion>
    )
  }

  return weeks
}

WeekReviews.propTypes = {
  courseId: PropTypes.string.isRequired,
  student: PropTypes.object.isRequired,
  studentInstance: PropTypes.string,
  openWeeks: PropTypes.object,
  handleClickWeek: PropTypes.func,

  user: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    selectedInstance: state.selectedInstance,
    courseData: state.coursePage,
    coursePageLogic: state.coursePageLogic,
    courseId: ownProps.courseId,
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
  sendEmail,
  updateActiveIndex,
  resetLoading,
  associateTeacherToStudent,
  selectTag,
  selectTeacher
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WeekReviews)
