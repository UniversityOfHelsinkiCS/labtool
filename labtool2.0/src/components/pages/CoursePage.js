import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation, modifyOneCI } from '../../services/courseInstance'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { associateTeacherToStudent } from '../../services/assistant'
import { prepareForCourse, coursePageReset, selectTag, selectTeacher } from '../../reducers/coursePageLogicReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { resetLoading } from '../../reducers/loadingReducer'

import { createDropdownTeachers, createDropdownTags } from '../../util/dropdown'
import CoursePageStudentInfo from './CoursePage/StudentInfo'
import CoursePageStudentRegister from './CoursePage/StudentRegister'
import CoursePageStudentWeeks from './CoursePage/StudentWeeks'
import CoursePageTeacherBulkForm from './CoursePage/TeacherBulkForm'
import CoursePageTeacherHeader from './CoursePage/TeacherHeader'
import CoursePageTeacherMain from './CoursePage/TeacherMain'

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

  const sortStudentArrayAlphabeticallyByDroppedValue = theArray =>
    theArray.sort(
      (a, b) =>
        !Number(a.validRegistration) - !Number(b.validRegistration) ||
        Number(a.dropped) - Number(b.dropped) ||
        a.User.lastname.localeCompare(b.User.lastname) ||
        a.User.firsts.localeCompare(b.User.firsts) ||
        a.id - b.id
    )

  const droppedTagExists = () => props.tags.tags && props.tags.tags.find(tag => tag.name.toUpperCase() === 'DROPPED')

  const hasDroppedTag = studentTagsData => {
    let studentInstanceTagNames = studentTagsData.map(tag => tag.name.toUpperCase())
    return studentInstanceTagNames.includes('DROPPED')
  }

  const markAllWithDroppedTagAsDropped = async courseData => {
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
      if (hasDroppedTag(studentTags) === true) {
        handleMarkAsDropped(true, student.User.id)
      }
    }
  }

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

    const students = sortStudentArrayAlphabeticallyByDroppedValue(courseData.data)
    const nowDate = new Date()
    const dateFormat = `${nowDate.getUTCFullYear()}-${twoPad(nowDate.getUTCMonth() + 1)}-${twoPad(nowDate.getUTCDate())}_${twoPad(nowDate.getUTCHours())}-${twoPad(nowDate.getUTCMinutes())}-${twoPad(
      nowDate.getUTCSeconds()
    )}`
    const csvFilename = `${courseId}_${dateFormat}.csv`
    const csvResult = []

    const columns = ['Name', 'StudentNo', 'Email', 'ProjectName', 'ProjectURL']
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
    csvResult.push(columns.join(','))

    students.forEach(student => {
      const values = [`${student.User.firsts} ${student.User.lastname}`, student.User.studentNumber, student.User.email, student.projectName, student.github]
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

  const handleMarkRegistrationAsValid = async (validRegistration, id) => {
    props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: id,
      validRegistration: validRegistration
    })
  }

  const changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      props.selectTeacher(value)
    }
  }

  const changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      props.selectTag(value)
    }
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

  let dropDownTags = []
  dropDownTags = createDropdownTags(props.tags.tags, dropDownTags)

  if (props.loading.loading) {
    return <Loader active />
  }

  const { courseId, courseData, coursePageLogic, courseInstance, selectedInstance, tags } = props

  // This function activates the course, leaving other data intact.
  const activateCourse = () => {
    props.changeCourseField({
      field: 'active',
      value: true
    })

    const { weekAmount, weekMaxPoints, currentWeek, ohid, finalReview, coursesPage, courseMaterial, currentCodeReview } = selectedInstance

    const content = {
      weekAmount,
      weekMaxPoints,
      currentWeek,
      active: true,
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
    if (!window.confirm('This will advance the course by 1 week. Confirm?')) {
      return
    }

    const { weekAmount, weekMaxPoints, currentWeek, active, ohid, finalReview, coursesPage, courseMaterial, currentCodeReview } = selectedInstance

    if (currentWeek === weekAmount) {
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

  /**
   * This part actually tells what to show to the user
   */
  if (props.courseData.role === 'student') {
    return (
      <div key>
        <CoursePageStudentRegister courseData={courseData} selectedInstance={selectedInstance} />
        <CoursePageStudentInfo courseData={courseData} selectedInstance={selectedInstance} />
        <CoursePageStudentWeeks courseId={courseId} courseData={courseData} />
      </div>
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
      <div style={{ overflowX: 'auto', overflowY: 'hidden', marginBottom: '20em' }}>
        <CoursePageTeacherHeader selectedInstance={selectedInstance} courseInstance={courseInstance} activateCourse={activateCourse} moveToNextWeek={moveToNextWeek} />
        <CoursePageTeacherMain
          courseId={courseId}
          courseData={courseData}
          selectedInstance={selectedInstance}
          coursePageLogic={coursePageLogic}
          tags={tags}
          droppedTagExists={droppedTagExists}
          markAllWithDroppedTagAsDropped={markAllWithDroppedTagAsDropped}
          students={sortStudentArrayAlphabeticallyByDroppedValue(courseData.data)}
          exportCSV={exportCSV}
        />
        <br />
        <CoursePageTeacherBulkForm courseId={courseId} coursePageLogic={coursePageLogic} dropDownTags={dropDownTags} dropDownTeachers={dropDownTeachers} {...coursePageBulkFormFunctions} />
      </div>
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
  downloadFile: PropTypes.func
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
  getOneCI,
  coursePageInformation,
  coursePageReset,
  prepareForCourse,
  getAllTags,
  tagStudent,
  unTagStudent,
  resetLoading,
  updateStudentProjectInfo,
  associateTeacherToStudent,
  selectTag,
  selectTeacher,
  changeCourseField,
  modifyOneCI
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursePage)
