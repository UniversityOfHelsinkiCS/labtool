import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Accordion, Card, Comment, Button, Label, Popup } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { LabtoolAddComment } from '../LabtoolAddComment'
import ReactMarkdown from 'react-markdown'

import { WeekReviewComment } from './WeekReviewComment'

export const WeekReviewWeek = props => {
  const {
    index,
    openWeeks,
    week,
    studentInstance,
    isFinalWeek,
    selectedInstance,
    courseId,
    user,
    isTeacher,
    getMaximumPointsForWeek,
    handleClickWeek,
    handleSubmit,
    sendCommentEmail,
    sendStudentEmail,
    sendWeekEmail,
    sortCommentsByDate,
    markComments
  } = props

  const i = index
  const reviewIndex = isFinalWeek ? selectedInstance.weekAmount + 1 : i + 1
  const isWeekOpen = openWeeks[i]

  const checkAllCommentsAreRead = weekComments => {
    const unReadComment = weekComments.find(comment => !(comment.isRead || []).includes(user.id))
    return unReadComment ? false : true
  }

  if (week) {
    return (
      <Accordion fluid styled id={`review${i}`}>
        <Accordion.Title active={isWeekOpen} index={i} onClick={handleClickWeek}>
          <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${week.weekNumber}`}, points {week.points} / {getMaximumPointsForWeek(week.weekNumber)}
        </Accordion.Title>
        <Accordion.Content active={isWeekOpen}>
          <h3>Review</h3>
          <Card fluid color="yellow">
            <Card.Content>
              <h4>
                {' '}
                Points {week.points} / {getMaximumPointsForWeek(week.weekNumber)}{' '}
              </h4>
              <h4> Feedback </h4>
              <ReactMarkdown>{week.feedback}</ReactMarkdown>{' '}
              {isTeacher && week.instructorNotes ? (
                <div>
                  <br />
                  <h4>Review notes for instructors </h4>
                  <ReactMarkdown>{week.instructorNotes}</ReactMarkdown>{' '}
                </div>
              ) : (
                <span />
              )}
            </Card.Content>
            {isTeacher ? (
              <Card.Content style={{ paddingBottom: '5px' }}>
                {!isFinalWeek &&
                  (week.notified ? (
                    <Label>
                      Notified <Icon name="check" color="green" />
                    </Label>
                  ) : (
                    <Button type="button" onClick={sendWeekEmail(week.id)} size="small">
                      Send email notification
                    </Button>
                  ))}
                <Link to={`/labtool/reviewstudent/${selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}>
                  <Popup trigger={<Button circular color="orange" icon={{ name: 'edit', color: 'black', size: 'large' }} />} content={isFinalWeek ? 'Edit final review' : 'Edit review'} />
                </Link>
              </Card.Content>
            ) : (
              <span />
            )}
          </Card>
          {week.comments.length === 0 ? null : (
            <div>
              <h4 style={{ display: 'inline-block' }}> Comments </h4>
              {isTeacher ? (
                <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                  {checkAllCommentsAreRead(week.comments) ? (
                    <Label>
                      You have read all comments
                      <Icon name="check" color="green" />
                    </Label>
                  ) : (
                    <Button compact color="green" onClick={() => markComments(week.comments)}>
                      Mark comments of this week as read
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
          )}
          <Comment.Group>
            {week.comments.length > 0 ? (
              <div>
                {sortCommentsByDate(week.comments).map(comment => (
                  <WeekReviewComment
                    key={`weekReviewComment${comment.id}`}
                    user={user}
                    comment={comment}
                    isFinalWeek={isFinalWeek}
                    isTeacher={isTeacher}
                    sendTeacherEmail={sendCommentEmail}
                    sendStudentEmail={sendStudentEmail}
                  />
                ))}
              </div>
            ) : (
              <h4> No comments </h4>
            )}
          </Comment.Group>
          <LabtoolAddComment weekId={week.id} commentFieldId={`${courseId}:${week.id}`} handleSubmit={handleSubmit} allowHidden={isTeacher} />
        </Accordion.Content>
      </Accordion>
    )
  } else {
    return (
      <Accordion fluid styled id={`review${i}`}>
        <Accordion.Title active={isWeekOpen} index={i} onClick={handleClickWeek}>
          <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`}{' '}
        </Accordion.Title>
        <Accordion.Content active={isWeekOpen}>
          {isTeacher && (
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
  }
}

WeekReviewWeek.propTypes = {
  index: PropTypes.number.isRequired,
  openWeeks: PropTypes.object.isRequired,
  week: PropTypes.object,
  isTeacher: PropTypes.bool,
  isFinalWeek: PropTypes.bool,
  studentInstance: PropTypes.string,
  selectedInstance: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,

  getMaximumPointsForWeek: PropTypes.func.isRequired,
  handleClickWeek: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  sendCommentEmail: PropTypes.func.isRequired,
  sendStudentEmail: PropTypes.func.isRequired,
  sendWeekEmail: PropTypes.func.isRequired,
  sortCommentsByDate: PropTypes.func.isRequired,
  markComments: PropTypes.func
}

export default WeekReviewWeek
