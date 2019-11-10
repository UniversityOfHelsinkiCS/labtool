import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Button, Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { sendEmail } from '../../services/email'
import { resetLoading } from '../../reducers/loadingReducer'
import { getCoursesByStudentId } from '../../services/studentinstances'
import { getAllTeacherCourses } from '../../services/teacherinstances'
import useLegacyState from '../../hooks/legacyState'

import BackButton from '../BackButton'
import { formatCourseName } from '../../util/format'
import WeekReviews from '../WeekReviews'
import { StudentCard } from './BrowseReviews/StudentCard'

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
    props.getAllTeacherCourses()
    props.getCoursesByStudentId(Number(props.studentInstance))
    if (!Object.keys(state.openWeeks).length && !state.openWeeks[props.selectedInstance.currentWeek - 1]) {
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

  const handleMarkAsDropped = async dropped => {
    await props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: props.courseData.data.find(data => data.id === Number(props.studentInstance)).userId,
      dropped
    })
  }

  const handleMarkAsValidRegistration = async validRegistration => {
    await props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: props.courseData.data.find(data => data.id === Number(props.studentInstance)).userId,
      validRegistration
    })
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

  const isTeacher = () => {
    return props.courseData.role === 'teacher'
  }

  if (state.initialLoading) {
    return <Loader active />
  }

  const student = props.courseData.data.find(student => student.id === Number(props.studentInstance))

  return (
    <div className="BrowseReviews" style={{ overflowX: 'auto' }}>
      <Loader active={props.loading.loading} />
      {isTeacher() && student ? (
        <div>
          <BackButton preset="coursePage" />
          <Link to={`/labtool/courses/${props.selectedInstance.ohid}`} style={{ textAlign: 'center' }}>
            <h2> {formatCourseName(props.selectedInstance.name, props.selectedInstance.ohid, props.selectedInstance.start)}</h2>
          </Link>
          <StudentCard
            student={student}
            otherParticipations={props.studentInstanceToBeReviewed.filter(
              courseInstance => courseInstance.ohid.includes(props.courseId.substring(0, 8)) && courseInstance.ohid !== props.courseId && courseInstance.courseInstances[0].validRegistration
            )}
            handleMarkAsDropped={handleMarkAsDropped}
            handleMarkAsValidRegistration={handleMarkAsValidRegistration}
            teacherInstance={props.teacherInstance}
          />
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
          <WeekReviews courseId={props.courseId} student={student} studentInstance={props.studentInstance} openWeeks={state.openWeeks} handleClickWeek={handleClick} />
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
    teacherInstance: state.teacherInstance, //courses that the teacher has
    loading: state.loading
  }
}

const mapDispatchToProps = {
  getOneCI,
  coursePageInformation,
  sendEmail,
  resetLoading,
  getCoursesByStudentId,
  getAllTeacherCourses,
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
  teacherInstance: PropTypes.array.isRequired,
  loading: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  getCoursesByStudentId: PropTypes.func.isRequired,
  getAllTeacherCourses: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(BrowseReviews)
)
