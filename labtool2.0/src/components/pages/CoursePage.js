import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router'
import { Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation, modifyOneCI } from '../../services/courseInstance'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { associateTeacherToStudent } from '../../services/assistant'
import { prepareForCourse, coursePageReset, selectTag, selectTeacher } from '../../reducers/coursePageLogicReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { updateStudentProjectInfo, removeStudent } from '../../services/studentinstances'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import { sortStudentsAlphabeticallyByDroppedValue } from '../../util/sort'

import { createDropdownTeachers, createDropdownTags } from '../../util/dropdown'
import CoursePageStudentInfo from './CoursePage/StudentInfo'
import CoursePageStudentRegister from './CoursePage/StudentRegister'
import CoursePageStudentWeeks from './CoursePage/StudentWeeks'
import CoursePageTeacherBulkForm from './CoursePage/TeacherBulkForm'
import CoursePageTeacherHeader from './CoursePage/TeacherHeader'
import CoursePageTeacherMain from './CoursePage/TeacherMain'

import Error from '../Error'
import DocumentTitle from '../DocumentTitle'

export const CoursePage = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.prepareForCourse(props.courseId)
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getAllTags()

    return () => {
      // run on component unmount
      props.coursePageReset()
    }
  }, [])

  const downloadFile = (filename, mime, data) => {
    // create temporary element and use that to initiate download

    const tempElement = document.createElement('a')
    tempElement.setAttribute('href', `data:${mime},${encodeURIComponent(data)}`)
    tempElement.setAttribute('download', filename)
    tempElement.style.display = 'none'

    document.body.appendChild(tempElement)
    tempElement.click()
    document.body.removeChild(tempElement)
  }

  const exportCSV = () => {
    const download = props.downloadFile || downloadFile
    const twoPad = number => `00${number}`.slice(-2)

    const students = sortStudentsAlphabeticallyByDroppedValue(courseData.data.filter(student => student.validRegistration))
    const nowDate = new Date()
    const dateFormat = `${nowDate.getUTCFullYear()}-${twoPad(nowDate.getUTCMonth() + 1)}-${twoPad(nowDate.getUTCDate())}_${twoPad(nowDate.getUTCHours())}-${twoPad(nowDate.getUTCMinutes())}-${twoPad(
      nowDate.getUTCSeconds()
    )}`
    const csvFilename = `${courseId}_${dateFormat}.csv`
    const csvResult = []

    const columns = ['First Name', 'Last Name', 'StudentNo', 'Email', 'ProjectName', 'ProjectURL']
    for (let i = 1; i <= props.selectedInstance.weekAmount; ++i) {
      columns.push(`Week${i}`)
    }
    for (let i = 1; i <= props.selectedInstance.amountOfCodeReviews; ++i) {
      columns.push(`CodeReview${i}`)
    }
    if (props.selectedInstance.finalReview) {
      columns.push('FinalReview')
    }
    columns.push('Sum')
    columns.push('Instructor')
    csvResult.push(columns.join(','))

    students.forEach(student => {
      let instructorName = 'unassigned'
      if (student.teacherInstanceId !== null) {
        const teacherInstance = props.selectedInstance.teacherInstances.find(ti => ti.id === student.teacherInstanceId)
        instructorName = `${teacherInstance.firsts} ${teacherInstance.lastname}`
      }
      const values = [student.User.firsts, student.User.lastname, student.User.studentNumber, student.User.email, student.projectName, student.github]
      let sum = 0
      const cr =
        student.codeReviews &&
        student.codeReviews.reduce((a, b) => {
          return { ...a, [b.reviewNumber]: b.points }
        }, {})
      let weekPoints = {}
      let finalPoints = undefined

      for (var j = 0; j < student.weeks.length; j++) {
        if (student.weeks[j].weekNumber === selectedInstance.weekAmount + 1) {
          finalPoints = student.weeks[j].points
        } else if (student.weeks[j].weekNumber) {
          weekPoints[student.weeks[j].weekNumber] = student.weeks[j].points
        }
      }
      for (let i = 1; i <= props.selectedInstance.weekAmount; ++i) {
        const points = weekPoints[i]
        values.push(points || points === 0 ? points : '-')
        sum += points || 0
      }
      for (let i = 1; i <= props.selectedInstance.amountOfCodeReviews; ++i) {
        const points = cr[i]
        values.push(points || points === 0 ? points : '-')
        sum += points || 0
      }
      if (props.selectedInstance.finalReview) {
        const points = finalPoints
        values.push(points || points === 0 ? points : '-')
        sum += points || 0
      }
      values.push(sum)
      values.push(instructorName)
      csvResult.push(values.join(','))
    })

    download(csvFilename, 'text/csv;charset=utf-8', csvResult.join('\n'))
  }

  const handleMarkAsDropped = async (dropped, id) => {
    props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: id,
      dropped: dropped
    })
  }

  const changeSelectedTeacher = (e, data) => {
    const { value } = data
    props.selectTeacher(value)
  }

  const handleMarkRegistrationAsValid = async (validRegistration, id) => {
    props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: id,
      validRegistration: validRegistration
    })
  }

  const changeSelectedTag = (e, data) => {
    const { value } = data
    props.selectTag(value)
  }

  const bulkDoAction = action => {
    const selectedStudents = props.coursePageLogic.selectedStudents
    const studentIds = Object.keys(selectedStudents).filter(key => selectedStudents[key])
    studentIds.forEach(action)
  }

  const bulkAddTag = () => {
    bulkDoAction(id => {
      const data = {
        studentId: id,
        tagId: props.coursePageLogic.selectedTag
      }
      props.tagStudent(data)
    })
  }

  const bulkRemoveTag = () => {
    bulkDoAction(id => {
      const data = {
        studentId: id,
        tagId: props.coursePageLogic.selectedTag
      }
      props.unTagStudent(data)
    })
  }

  const bulkUpdateTeacher = () => {
    let teacherId = props.coursePageLogic.selectedTeacher
    if (teacherId === '-') {
      // unassign
      teacherId = null
    }
    bulkDoAction(id => {
      const data = {
        studentInstanceId: id,
        teacherInstanceId: teacherId
      }
      props.associateTeacherToStudent(data)
    })
  }

  const bulkMarkDroppedBool = dropped => {
    bulkDoAction(id => {
      const student = props.courseData.data.find(data => data.id === Number(id))
      if (student) {
        handleMarkAsDropped(dropped, student.User.id)
      }
    })
  }

  const bulkMarkNotDropped = () => {
    bulkMarkDroppedBool(false)
  }

  const bulkMarkDropped = () => {
    bulkMarkDroppedBool(true)
  }

  const bulkMarkValidRegistrationBool = validRegistration => {
    bulkDoAction(id => {
      const student = props.courseData.data.find(data => data.id === Number(id))
      if (student) {
        handleMarkRegistrationAsValid(validRegistration, student.User.id)
      }
    })
  }

  const bulkMarkValid = () => {
    bulkMarkValidRegistrationBool(true)
  }

  const bulkMarkInvalid = () => {
    bulkMarkValidRegistrationBool(false)
  }

  let dropDownTeachers = []
  dropDownTeachers = createDropdownTeachers(props.selectedInstance.teacherInstances, dropDownTeachers)

  const courseTags = (props.tags.tags || []).filter(tag => tag.courseInstanceId === null || tag.courseInstanceId === props.selectedInstance.id)
  let dropDownTags = []
  dropDownTags = createDropdownTags(courseTags, dropDownTags)

  if (props.errors && props.errors.length > 0) {
    return <Error errors={props.errors.map(error => `${error.response.data} (${error.response.status} ${error.response.statusText})`)} />
  }

  if (props.loading.loading) {
    return <Loader active />
  }

  const { user, courseId, courseData, coursePageLogic, courseInstance, selectedInstance, tags } = props

  // This function activates the course, leaving other data intact.
  const changeCourseActive = newState => {
    props.changeCourseField({
      field: 'active',
      value: newState
    })

    const { weekAmount, weekMaxPoints, currentWeek, ohid, finalReview, coursesPage, courseMaterial, currentCodeReview } = selectedInstance

    const content = {
      weekAmount,
      weekMaxPoints,
      currentWeek,
      active: newState,
      ohid,
      finalReview,
      newCr: currentCodeReview,
      coursesPage,
      courseMaterial
    }

    props.resetLoading()
    props.modifyOneCI(content, selectedInstance.ohid)
  }

  // This function advances the current week by 1, leaving other data intact.
  const moveToNextWeek = () => {
    const { weekAmount, weekMaxPoints, currentWeek, active, ohid, finalReview, coursesPage, courseMaterial, currentCodeReview } = selectedInstance

    // We can advance past the final week for code review purposes.
    if (currentWeek >= weekAmount + (finalReview ? 1 : 0)) {
      return
    }

    const nextWeek = currentWeek + 1

    const content = {
      weekAmount,
      weekMaxPoints,
      currentWeek: nextWeek,
      active,
      ohid,
      finalReview,
      newCr: currentCodeReview,
      coursesPage,
      courseMaterial
    }

    props.changeCourseField({
      field: 'currentWeek',
      value: nextWeek
    })

    props.resetLoading()
    props.modifyOneCI(content, selectedInstance.ohid)
  }

  const removeRegistration = studentId => {
    const si = {
      id: studentId
    }
    try {
      props.removeStudent(si)
      props.addRedirectHook({
        hook: 'STUDENT_REMOVE_'
      })
    } catch (err) {
      console.log(err)
    }
  }

  const documentTitle = <DocumentTitle title={selectedInstance.name} />

  /**
   * This part actually tells what to show to the user
   */
  if (props.courseData.role === 'student') {
    if (props.loading.redirect) {
      return <Redirect to={'/labtool/mypage'} />
    }
    return (
      <>
        {documentTitle}
        <div key>
          <CoursePageStudentRegister courseData={courseData} selectedInstance={selectedInstance} />
          <CoursePageStudentInfo courseData={courseData} selectedInstance={selectedInstance} removeRegistration={removeRegistration} />
          <CoursePageStudentWeeks courseId={courseId} courseData={courseData} />
        </div>
      </>
    )
  } else if (props.courseData.role === 'teacher') {
    const coursePageBulkFormFunctions = {
      changeSelectedTag,
      changeSelectedTeacher,
      bulkAddTag,
      bulkRemoveTag,
      bulkUpdateTeacher,
      bulkMarkDropped,
      bulkMarkNotDropped,
      bulkMarkValid,
      bulkMarkInvalid
    }
    return (
      <>
        {documentTitle}
        <div style={{ overflowX: 'auto', overflowY: 'hidden', marginBottom: '-20em', paddingBottom: '20em' }}>
          <CoursePageTeacherHeader selectedInstance={selectedInstance} changeCourseActive={changeCourseActive} moveToNextWeek={moveToNextWeek} />
          <CoursePageTeacherMain
            courseId={courseId}
            courseData={courseData}
            selectedInstance={selectedInstance}
            loggedInUser={user}
            coursePageLogic={coursePageLogic}
            tags={tags}
            students={sortStudentsAlphabeticallyByDroppedValue(courseData.data)}
          />
          <br />
          <CoursePageTeacherBulkForm
            courseId={courseId}
            coursePageLogic={coursePageLogic}
            dropDownTags={dropDownTags}
            dropDownTeachers={dropDownTeachers}
            {...coursePageBulkFormFunctions}
            exportCSV={exportCSV}
            selectedInstance={selectedInstance}
          />
        </div>
      </>
    )
  } else {
    return <div />
  }
}

CoursePage.propTypes = {
  courseId: PropTypes.string.isRequired,

  user: PropTypes.object.isRequired,
  studentInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  teacherInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  selectedInstance: PropTypes.object.isRequired,
  courseInstance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  courseData: PropTypes.object.isRequired,
  coursePageLogic: PropTypes.object.isRequired,
  tags: PropTypes.object.isRequired,
  loading: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  coursePageReset: PropTypes.func.isRequired,
  prepareForCourse: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  associateTeacherToStudent: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  changeCourseField: PropTypes.func.isRequired,
  modifyOneCI: PropTypes.func.isRequired,
  downloadFile: PropTypes.func,
  addRedirectHook: PropTypes.func,
  removeStudent: PropTypes.func
}

const mapStateToProps = (state, ownProps) => {
  console.log(state.loading)
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
    loading: state.loading,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  getOneCI,
  coursePageInformation,
  coursePageReset,
  prepareForCourse,
  getAllTags,
  tagStudent,
  unTagStudent,
  resetLoading,
  addRedirectHook,
  updateStudentProjectInfo,
  associateTeacherToStudent,
  selectTag,
  selectTeacher,
  changeCourseField,
  modifyOneCI,
  removeStudent
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
