import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Accordion, Card, Comment, Button, Label, Popup } from 'semantic-ui-react'
import ReviewNotes from '../ReviewNotes'
import { reviewTitleStyle } from './reviewTitleStyle'
import { Link } from 'react-router-dom'
import { LabtoolAddComment } from '../LabtoolAddComment'
import ReactMarkdown from 'react-markdown'

import { WeekReviewComment } from './WeekReviewComment'
import MissingMinimumRequirements from '../MissingMinimumRequirements'
import { Points } from '../Points'

export const WeekReviewWeek = props => {
  const {
    index,
    openWeeks,
    week,
    studentInstance,
    isFinalWeek,
    selectedInstance,
    courseData,
    courseId,
    user,
    isTeacher,
    getMaximumPointsForWeek,
    handleClickWeek,
    handleSubmitComment,
    sendCommentEmail,
    sendStudentEmail,
    sendWeekEmail,
    sortCommentsByDate,
    editComment,
    markComments
  } = props

  const i = index
  const reviewIndex = isFinalWeek ? selectedInstance.weekAmount + 1 : i + 1
  // additional final review notes by staff (only in the staff's data)
  const studentOfWeek =
    courseData && Array.isArray(courseData.data)
      ? courseData.data.find(si => si.id === Number(studentInstance))
      : null
  const additionalNotes =
    isFinalWeek && studentOfWeek
      ? (studentOfWeek.reviewNotes || []).filter(note => note.weekNumber === reviewIndex)
      : []
  // final review results stay hidden from students until shown in the course settings
  const hiddenFromStudents = isFinalWeek && !selectedInstance.finalReviewVisible
  const hiddenLabel = hiddenFromStudents && (
    <Label className="finalReviewHidden" color="orange" size="small" style={{ marginLeft: '8px' }}>
      <Icon name="eye slash" />
      Hidden from students
    </Label>
  )
  const isWeekOpen = openWeeks[i]

  const checkAllCommentsAreRead = weekComments => {
    const unReadComment = weekComments.find(comment => !(comment.isRead || []).includes(user.id))
    return unReadComment ? false : true
  }

  if (week) {
    // week.points may be null for final review if points for the final review are disabled
    const pointInfo =
      week.points !== null ? (
        <>
          , points <Points points={week.points} /> /{' '}
          <Points points={getMaximumPointsForWeek(week.weekNumber)} />
        </>
      ) : null
    const gradeInfo = week.grade ? `, grade ${week.grade}` : ''
    return (
      <Accordion fluid styled id={isFinalWeek ? 'reviewFinal' : `reviewWeek${week.weekNumber}`}>
        <Accordion.Title
          className="reviewTitle"
          style={reviewTitleStyle}
          active={isWeekOpen}
          index={i}
          onClick={handleClickWeek}
        >
          <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${week.weekNumber}`}
          {pointInfo}
          {gradeInfo}
          {isTeacher && hiddenLabel}
        </Accordion.Title>
        <Accordion.Content active={isWeekOpen}>
          <Card fluid color="yellow">
            <Card.Content>
              <h4>
                {' '}
                {week.points !== null ? (
                  <>
                    Points <Points points={week.points} /> /{' '}
                    <Points points={getMaximumPointsForWeek(week.weekNumber)} />
                    {gradeInfo}
                  </>
                ) : week.grade !== null ? (
                  <>Grade {week.grade}</>
                ) : null}{' '}
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
              {isTeacher && additionalNotes.length > 0 && (
                <div className="additionalReviewNotes">
                  <br />
                  <h4>Additional review notes</h4>
                  <ReviewNotes notes={additionalNotes} />
                </div>
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
                <Link
                  to={`/labtool/reviewstudent/${selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}
                >
                  <Popup
                    trigger={
                      <Button
                        circular
                        color="orange"
                        icon={{ name: 'edit', color: 'black', size: 'large' }}
                      />
                    }
                    content={isFinalWeek ? 'Edit final review' : 'Edit review'}
                  />
                </Link>
              </Card.Content>
            ) : (
              <span />
            )}
          </Card>
          {courseData && courseData.role === 'teacher' && isFinalWeek && (
            <MissingMinimumRequirements
              selectedInstance={selectedInstance}
              studentInstance={courseData.data.find(si => si.id === Number(studentInstance))}
              showMaximumGrade
              currentWeekNumber={week.weekNumber}
            />
          )}
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
                {sortCommentsByDate(week.comments).map((comment, index, array) => (
                  <WeekReviewComment
                    key={`weekReviewComment${comment.id}`}
                    user={user}
                    comment={comment}
                    isFinalWeek={isFinalWeek}
                    isTeacher={isTeacher}
                    sendTeacherEmail={sendCommentEmail}
                    sendStudentEmail={sendStudentEmail}
                    latestComment={index >= array.length - 1}
                    editComment={editComment}
                  />
                ))}
              </div>
            ) : (
              <h4> No comments </h4>
            )}
          </Comment.Group>
          <LabtoolAddComment
            weekId={week.id}
            commentFieldId={`${courseId}:${week.id}`}
            handleSubmit={e => handleSubmitComment(e, week.comments)}
            allowHidden={isTeacher}
          />
        </Accordion.Content>
      </Accordion>
    )
  } else {
    return (
      <Accordion fluid styled id={`review${i}`}>
        <Accordion.Title
          className="reviewTitle"
          style={reviewTitleStyle}
          active={isWeekOpen}
          index={i}
          onClick={handleClickWeek}
        >
          <Icon name="dropdown" /> {isFinalWeek ? 'Final Review' : `Week ${i + 1}`} {isTeacher && hiddenLabel}
        </Accordion.Title>
        <Accordion.Content active={isWeekOpen}>
          {isTeacher && (
            <>
              <Link
                to={`/labtool/reviewstudent/${props.selectedInstance.ohid}/${studentInstance}/${reviewIndex}`}
              >
                <Popup
                  trigger={
                    <Button
                      circular
                      color="orange"
                      size="tiny"
                      icon={{ name: 'edit', color: 'black', size: 'large' }}
                    />
                  }
                  content={isFinalWeek ? 'Give Final Review' : 'Review week'}
                />
              </Link>
            </>
          )}
          {!isTeacher && hiddenFromStudents ? (
            <h4 className="finalReviewNotShown">Final review results are not shown yet.</h4>
          ) : (
            <>
              <h4> Not Graded </h4>
              <h4> No comments </h4>
            </>
          )}
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
  courseData: PropTypes.object,
  courseId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,

  getMaximumPointsForWeek: PropTypes.func.isRequired,
  handleClickWeek: PropTypes.func.isRequired,
  handleSubmitComment: PropTypes.func.isRequired,
  sendCommentEmail: PropTypes.func.isRequired,
  sendStudentEmail: PropTypes.func.isRequired,
  sendWeekEmail: PropTypes.func.isRequired,
  sortCommentsByDate: PropTypes.func.isRequired,
  editComment: PropTypes.func,
  markComments: PropTypes.func
}

export default WeekReviewWeek
