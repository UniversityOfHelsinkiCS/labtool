import React from 'react'
import PropTypes from 'prop-types'
import { LabtoolComment } from '../LabtoolComment'

export const WeekReviewComment = ({ user, comment, isFinalWeek, isTeacher, sendTeacherEmail, sendStudentEmail, latestComment }) => {
  /* This hack compares user's name to comment.from and hides the email notification button when they don't match. */
  const userIsCommandSender = comment.from.includes(user.firsts) && comment.from.includes(user.lastname)

  return (
    <LabtoolComment
      key={comment.id}
      comment={comment}
      allowNotify={!isFinalWeek && userIsCommandSender}
      sendCommentEmail={(isTeacher ? sendTeacherEmail : sendStudentEmail)(comment.id)}
      latestComment={latestComment}
    />
  )
}

WeekReviewComment.propTypes = {
  user: PropTypes.object.isRequired,
  comment: PropTypes.object.isRequired,
  isFinalWeek: PropTypes.bool,
  isTeacher: PropTypes.bool,
  latestComment: PropTypes.bool,
  sendTeacherEmail: PropTypes.func.isRequired,
  sendStudentEmail: PropTypes.func.isRequired
}

export default WeekReviewComment
