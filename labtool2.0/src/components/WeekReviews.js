import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Accordion } from 'semantic-ui-react'
import { createOneComment } from '../services/comment'
import { getOneCI, coursePageInformation } from '../services/courseInstance'
import { associateTeacherToStudent } from '../services/assistant'
import { addLinkToCodeReview, gradeCodeReview } from '../services/codeReview'
import { sendEmail } from '../services/email'
import { markCommentsAsRead } from '../services/comment'
import { coursePageReset, updateActiveIndex, toggleCodeReview, selectTag, selectTeacher } from '../reducers/coursePageLogicReducer'
import { resetLoading } from '../reducers/loadingReducer'
import useLegacyState from '../hooks/legacyState'

import { WeekReviewWeek } from './WeekReview/WeekReviewWeek'
import { WeekReviewCodeReview } from './WeekReview/WeekReviewCodeReview'

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

  const getMaximumPoints = week => {
    const checklist = props.selectedInstance.checklists.find(checkl => checkl.week === week)
    if (checklist && checklist.maxPoints) {
      return checklist.maxPoints
    }
    return props.selectedInstance.weekMaxPoints
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
  const handleClickWeek = props.handleClickWeek || handleClickNative

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
    document.getElementById(e.target.name).reset()
    try {
      await props.createOneComment(content)
    } catch (error) {
      console.error(error)
    }
  }

  const markComments = async comments => {
    await props.markCommentsAsRead(comments)
  }

  const weekMatcher = i => week => week.weekNumber === i + 1
  const weekAmount = props.selectedInstance.weekAmount

  const weekReviewFunctions = {
    getMaximumPoints,
    handleClickWeek,
    handleSubmit,
    sendWeekEmail,
    sendCommentEmail,
    sendStudentEmail,
    sortCommentsByDate
  }

  const codeReviewFunctions = {
    handleClickWeek,
    gradeCodeReview,
    handleAddingIssueLink
  }

  const normalWeeks = []
  for (let i = 0; i < weekAmount; ++i) {
    normalWeeks.push(
      <WeekReviewWeek
        key={`weekReviewWeek${i}`}
        index={i}
        week={props.student.weeks.find(weekMatcher(i))}
        studentInstance={props.studentInstance}
        isFinalWeek={false}
        openWeeks={props.openWeeks || state.openWeeks}
        selectedInstance={props.selectedInstance}
        courseId={props.courseId}
        user={props.user.user}
        isTeacher={isTeacher()}
        markComments={markComments}
        {...weekReviewFunctions}
      />
    )
  }

  const codeReviews = props.student.codeReviews
    .sort((a, b) => {
      return a.reviewNumber - b.reviewNumber
    })
    .map((cr, indx) => (
      <WeekReviewCodeReview
        key={`weekReviewCodeReview${indx}`}
        index={weekAmount + indx + 1}
        cr={cr}
        studentInstance={props.studentInstance}
        openWeeks={props.openWeeks || state.openWeeks}
        courseId={props.courseId}
        courseData={props.courseData}
        coursePageLogic={props.coursePageLogic}
        isTeacher={isTeacher()}
        {...codeReviewFunctions}
      />
    ))

  const finalReview = []
  if (props.selectedInstance.finalReview) {
    finalReview.push(
      <WeekReviewWeek
        key="weekReviewWeekFinal"
        index={weekAmount + codeReviews.length + 1}
        week={props.student.weeks.find(weekMatcher(weekAmount))}
        studentInstance={props.studentInstance}
        isFinalWeek={true}
        openWeeks={props.openWeeks || state.openWeeks}
        selectedInstance={props.selectedInstance}
        courseId={props.courseId}
        user={props.user.user}
        isTeacher={isTeacher()}
        {...weekReviewFunctions}
      />
    )
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
  loading: PropTypes.object.isRequired,

  createOneComment: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  addLinkToCodeReview: PropTypes.func.isRequired,
  gradeCodeReview: PropTypes.func.isRequired,
  coursePageReset: PropTypes.func.isRequired,
  toggleCodeReview: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  updateActiveIndex: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  associateTeacherToStudent: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  markCommentsAsRead: PropTypes.func
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
  gradeCodeReview,
  coursePageReset,
  toggleCodeReview,
  sendEmail,
  updateActiveIndex,
  resetLoading,
  associateTeacherToStudent,
  selectTag,
  selectTeacher,
  markCommentsAsRead
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WeekReviews)
