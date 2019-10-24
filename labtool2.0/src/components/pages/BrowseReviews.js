import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Button, Card, Accordion, Icon, Form, Comment, Input, Popup, Loader, Label, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { gradeCodeReview } from '../../services/codeReview'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import ReactMarkdown from 'react-markdown'
import { sendEmail } from '../../services/email'
import { resetLoading } from '../../reducers/loadingReducer'
import { createCourseIdWithYearAndTerm } from '../../util/format'
import { getCoursesByStudentId } from '../../services/studentinstances'
import useLegacyState from '../../hooks/legacyState'

import BackButton from '../BackButton'
import LabtoolComment from '../LabtoolComment'
import LabtoolAddComment from '../LabtoolAddComment'
import { formatCourseName } from '../../util/format'
import RepoLink from '../RepoLink'

/**
 * Maps all comments from a single instance from coursePage reducer
 */
export const BrowseReviews = props => {
  const state = useLegacyState({
    openWeeks: {},
    initialLoading: props.initialLoading !== undefined ? props.initialLoading : true
  })
  let jumpTimer = null

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getCoursesByStudentId(Number(props.studentInstance))
    if (!props.loading.loading && !state.openWeeks[props.selectedInstance.currentWeek - 1]) {
      state.openWeeks = { [props.selectedInstance.currentWeek - 1]: true }
    }

    if (props.location.state && props.location.state.jumpToReview !== undefined) {
      // jumpToReview from <Link state={...}>: scrolls to review
      const tryJumpLoop = () => {
        if (!tryJumpToReview()) {
          // not loaded yet? try again later
          jumpTimer = setTimeout(tryJumpLoop, 200)
        }
      }
      jumpTimer = setTimeout(tryJumpLoop, 200)
    }

    return () => {
      clearTimeout(jumpTimer)
    }
  }, [])

  useEffect(() => {
    if (!props.loading.loading && state.initialLoading) {
      state.initialLoading = false
    }
  }, [props.loading.loading, state.initialLoading])

  useEffect(() => {
    if (props.location.state && props.location.state.openAllWeeks) {
      handleClickShowAllCurrent()
    }
  }, [props.courseData.data])

  const tryJumpToReview = () => {
    // Try scroll to review
    const element = document.getElementById(`review${props.location.state.jumpToReview}`)

    if (element) {
      window.scrollTo(0, element.offsetTop)
      return true
    }
    return false
  }

  const handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { openWeeks } = state
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

  const getMaximumIndexForStudent = student => {
    // how many reviews will there be?
    return props.selectedInstance.weekAmount + student.codeReviews.length + (props.selectedInstance.finalReview ? 2 : 1)
  }

  const hasAllReviewsOpen = student => {
    return Object.values(state.openWeeks).filter(x => x).length === getMaximumIndexForStudent(student)
  }

  const handleClickShowAll = student => () => {
    const openWeeks = {}
    const maximumIndex = getMaximumIndexForStudent(student)
    for (let i = 0; i < maximumIndex; i++) {
      openWeeks[i] = true
    }
    state.openWeeks = openWeeks
  }

  const handleClickShowAllCurrent = () => {
    if (props.courseData.data && props.studentInstance) {
      const student = props.courseData.data.find(student => student.id === Number(props.studentInstance))
      if (student) {
        handleClickShowAll(student)()
      }
    }
  }

  const handleClickHideAll = () => {
    state.openWeeks = {}
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: e.target.hidden.checked,
      comment: e.target.content.value,
      week: parseInt(e.target.name, 10)
    }
    document.getElementById(e.target.name).reset()
    try {
      await props.createOneComment(content)
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkAsDropped = async dropped => {
    await props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: props.courseData.data.find(data => data.id === Number(props.studentInstance)).userId,
      dropped
    })
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

  const isTeacher = () => {
    return props.courseData.role === 'teacher'
  }

  //get student's other participations in the same course
  const renderStudentPreviousParticipation = () => {
    const previousParticipations = props.studentInstanceToBeReviewed.filter(courseInstance => courseInstance.ohid.includes(props.courseId.substring(0, 8)) && courseInstance.ohid !== props.courseId)
    if (previousParticipations.length === 0) {
      return <p className="noOther">Has no other participation in this course</p>
    }
    return (
      <div className="hasOther">
        <p style={{ color: 'red' }}>Has taken this course in other periods</p>
        {previousParticipations.map(participation => (
          <Link key={participation.id} to={`/labtool/browsereviews/${participation.ohid}/${participation.courseInstances[0].id}`}>
            <Popup content="click to see the details" trigger={<p>{createCourseIdWithYearAndTerm(participation.ohid, participation.start)}</p>} />
          </Link>
        ))}
      </div>
    )
  }

  const renderStudentCard = student => (
    <Card key={student.id} fluid color="yellow" className="studentCard">
      <Card.Content>
        <Header as="h2">
          {student.User.firsts} {student.User.lastname} ({student.User.studentNumber})
          {student.dropped && (
            <Label style={{ marginTop: 5, float: 'right' }}>
              <Icon name="warning sign" color="red" />
              Has dropped course
            </Label>
          )}
          <Header.Subheader>
            <a href={`mailto:${student.User.email}`}>{student.User.email}</a>
          </Header.Subheader>
        </Header>
        <div style={{ display: 'inline-block' }}>
          {student.projectName}: <RepoLink url={student.github} />
          <br />
          {renderStudentPreviousParticipation()}
        </div>
        {
          <Button color="red" style={{ float: 'right' }} onClick={() => handleMarkAsDropped(!student.dropped)}>
            {student.dropped ? 'Mark as non-dropped' : 'Mark as dropped'}
          </Button>
        }
      </Card.Content>
    </Card>
  )

  const renderComment = (isFinalWeek, comment) => {
    /* This hack compares user's name to comment.from and hides the email notification button when they don't match. */
    const userIsCommandSender = comment.from.includes(props.user.user.firsts) && comment.from.includes(props.user.user.lastname)

    return <LabtoolComment key={comment.id} comment={comment} allowNotify={!isFinalWeek && userIsCommandSender} sendCommentEmail={sendCommentEmail(comment.id)} />
  }

  const renderWeek = (i, week, studentInstance, isFinalWeek) => {
    const { openWeeks } = state
    const reviewIndex = isFinalWeek ? props.selectedInstance.weekAmount + 1 : i + 1

    if (week) {
      return (
        <Accordion fluid styled id={`review${i}`}>
          <Accordion.Title active={openWeeks[i]} index={i} onClick={handleClick}>
            <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}, points {week.points}
          </Accordion.Title>
          <Accordion.Content active={openWeeks[i]}>
            <h3>Review</h3>
            <Link to={`/labtool/reviewstudent/${props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Edit final review' : 'Edit review'} />
            </Link>
            <Card fluid color="yellow">
              <Card.Content>
                <h4> Points {week.points} </h4>
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
              {!isFinalWeek ? (
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
            <h4> Comments </h4>
            <Comment.Group>{week ? sortCommentsByDate(week.comments).map(c => renderComment(isFinalWeek, c)) : <h4> No comments </h4>}</Comment.Group>
            <LabtoolAddComment weekId={week.id} commentFieldId={`${props.courseId}:${week.id}`} handleSubmit={handleSubmit} allowHidden={true} />
          </Accordion.Content>
        </Accordion>
      )
    } else {
      return (
        <Accordion fluid styled id={`review${i}`}>
          <Accordion.Title active={openWeeks[i]} index={i} onClick={handleClick}>
            <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}{' '}
          </Accordion.Title>
          <Accordion.Content active={openWeeks[i]}>
            <h3>Review</h3>
            <Link to={`/labtool/reviewstudent/${props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
              <Popup trigger={<Button circular color="orange" size="tiny" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Give Final Review' : 'Review week'} />
            </Link>
            <h4> Not Graded </h4>
            <h4> No comments </h4>
          </Accordion.Content>
        </Accordion>
      )
    }
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

  const renderCodeReview = (i, cr, studentInstance) => {
    const { openWeeks } = state

    return (
      <Accordion fluid styled id={`review${i - 1}`}>
        {' '}
        <Accordion.Title active={openWeeks[i]} index={i} onClick={handleClick}>
          <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
        </Accordion.Title>
        <Accordion.Content active={openWeeks[i]}>
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
        </Accordion.Content>
      </Accordion>
    )
  }

  if (state.initialLoading) {
    return <Loader active />
  }

  const createHeaders = (studhead, studentInstance) => {
    let headers = []
    const weekMatcher = i => week => week.weekNumber === i + 1
    // studentInstance is id of student. Type: String
    // Tämä pitää myös korjata.
    const student = studhead.data.find(student => student.id === Number(studentInstance))
    if (student) {
      headers.push(renderStudentCard(student))
      headers.push(
        <span>
          {hasAllReviewsOpen(student) ? (
            <Button type="button" onClick={handleClickHideAll} size="small">
              Hide all reviews
            </Button>
          ) : (
            <Button type="button" onClick={handleClickShowAll(student)} size="small">
              Show all reviews
            </Button>
          )}
          <br />
        </span>
      )
      let i = 0
      let ii = 0
      for (; i < props.selectedInstance.weekAmount; i++) {
        const weeks = student.weeks.find(weekMatcher(i))
        headers.push(renderWeek(i, weeks, studentInstance, false))
      }
      student.codeReviews
        .sort((a, b) => {
          return a.reviewNumber - b.reviewNumber
        })
        .forEach(cr => {
          headers.push(renderCodeReview(i + ii + 1, cr, studentInstance))
          ii++
        })
      if (props.selectedInstance.finalReview) {
        const finalWeek = student.weeks.find(week => week.weekNumber === props.selectedInstance.weekAmount + 1)
        headers.push(renderWeek(i + ii + 1, finalWeek, studentInstance, true))
      }
    }
    return headers.map((header, index) => React.cloneElement(header, { key: index }))
  }

  return (
    <div className="BrowseReviews" style={{ overflowX: 'auto' }}>
      <Loader active={props.loading.loading} />
      {isTeacher() ? (
        <div>
          <BackButton preset="coursePage" />
          <Link to={`/labtool/courses/${props.selectedInstance.ohid}`} style={{ textAlign: 'center' }}>
            <h2> {formatCourseName(props.selectedInstance.name, props.selectedInstance.ohid, props.selectedInstance.start)}</h2>
          </Link>
          {createHeaders(props.courseData, props.studentInstance)}
        </div>
      ) : (
        <p />
      )}
    </div>
  )
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
  resetLoading,
  getCoursesByStudentId,
  updateStudentProjectInfo
}

BrowseReviews.propTypes = {
  courseId: PropTypes.string.isRequired,
  studentInstance: PropTypes.string.isRequired,
  initialLoading: PropTypes.bool,
  location: PropTypes.object,

  user: PropTypes.object.isRequired,
  selectedInstance: PropTypes.object.isRequired,
  courseData: PropTypes.object.isRequired,
  studentInstanceToBeReviewed: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  loading: PropTypes.object.isRequired,

  createOneComment: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  gradeCodeReview: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  getCoursesByStudentId: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BrowseReviews)
)
