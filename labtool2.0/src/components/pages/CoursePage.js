import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Table, Card, Header, Label, Message, Icon, Popup, Loader, Dropdown, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation, modifyOneCI } from '../../services/courseInstance'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { associateTeacherToStudent } from '../../services/assistant'
import { coursePageReset, selectTag, selectTeacher } from '../../reducers/coursePageLogicReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { resetLoading } from '../../reducers/loadingReducer'
import { usePersistedState } from '../../hooks/persistedState'

import StudentTable from '../StudentTable'
import WeekReviews from '../WeekReviews'
import { createDropdownTeachers, createDropdownTags } from '../../util/dropdown'
import { formatCourseName } from '../../util/format'

const CoursePageHeader = ({ courseInstance }) => (
  <Header as="h2" style={{ marginBottom: '1em' }}>
    <Header.Content>
      {formatCourseName(courseInstance.name, courseInstance.ohid, courseInstance.start)}
      <Header.Subheader>
        {courseInstance.coursesPage && <a href={courseInstance.coursesPage}>courses.helsinki.fi</a>} {courseInstance.coursesPage && courseInstance.courseMaterial && '|'}{' '}
        {courseInstance.courseMaterial && <a href={courseInstance.courseMaterial}>Course material</a>}
      </Header.Subheader>
    </Header.Content>
  </Header>
)

CoursePageHeader.propTypes = {
  courseInstance: PropTypes.object.isRequired
}

export const CoursePage = props => {
  const state = usePersistedState(`CoursePage-${props.courseId}`, { showMassAssignForm: false })

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getAllTags()

    return () => {
      // run on component unmount
      props.coursePageReset()
    }
  }, [])

  const sortStudentArrayAlphabeticallyByDroppedValue = theArray =>
    theArray.sort((a, b) => Number(a.dropped) - Number(b.dropped) || a.User.lastname.localeCompare(b.User.lastname) || a.User.firsts.localeCompare(b.User.firsts) || a.id - b.id)

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

  const handleMarkAsDropped = async (dropped, id) => {
    props.updateStudentProjectInfo({
      ohid: props.selectedInstance.ohid,
      userId: id,
      dropped: dropped
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

  const renderStudentBottomPart = () => {
    if (!(courseData && courseData.data)) {
      return <div />
    }

    return (
      <div>
        <div key="student info">
          {courseData.data.User ? (
            <Card key="card" fluid color="yellow">
              <Card.Content>
                <h2>
                  {courseData.data.User.firsts} {courseData.data.User.lastname}
                </h2>
                <h3> {courseData.data.projectName} </h3>
                <h3>
                  <a href={courseData.data.github} target="_blank" rel="noopener noreferrer">
                    {courseData.data.github}
                  </a>{' '}
                  <Link to={`/labtool/courseregistration/${selectedInstance.ohid}`}>
                    <Button circular floated="right" size="large" icon={{ name: 'edit', color: 'orange', size: 'large' }} />
                  </Link>
                </h3>
              </Card.Content>
            </Card>
          ) : (
            <div />
          )}
        </div>

        {courseData.data.weeks && <WeekReviews courseId={courseId} student={props.courseData.data} />}
      </div>
    )
  }

  /**
   * Returns what teachers should see at the top of this page
   */
  let renderTeacherTopPart = () => {
    const weekAdvanceEnabled = selectedInstance.currentWeek !== selectedInstance.weekAmount

    return (
      <div className="TeachersTopView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <CoursePageHeader courseInstance={selectedInstance} />
        {courseInstance &&
          courseInstance.active !== true &&
          (!selectedInstance.active && (
            <div>
              <Message compact>
                <Message.Header>The registration is not active on this course.</Message.Header>
              </Message>

              <Button color="green" style={{ marginLeft: '25px' }} onClick={() => activateCourse()}>
                Activate now
              </Button>
              <br />
            </div>
          ))}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Cell>
                <div>
                  {selectedInstance.active === true ? (
                    <Label ribbon style={{ backgroundColor: '#21ba45' }}>
                      Active registration
                    </Label>
                  ) : (
                    <div />
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>Week amount: {selectedInstance.weekAmount}</Table.Cell>
              <Table.Cell>
                Current week: {selectedInstance.currentWeek}
                <Popup
                  content={weekAdvanceEnabled ? 'Advance course by 1 week' : 'Already at final week'}
                  trigger={
                    <Icon disabled={!weekAdvanceEnabled} name="right arrow" onClick={() => moveToNextWeek()} style={{ marginLeft: '15px', cursor: weekAdvanceEnabled ? 'pointer' : 'not-allowed' }} />
                  }
                />
              </Table.Cell>
              <Table.Cell>Week max points: {selectedInstance.weekMaxPoints}</Table.Cell>
              <Table.Cell textAlign="right">
                {' '}
                <Link to={`/labtool/ModifyCourseInstancePage/${selectedInstance.ohid}`}>
                  <Popup trigger={<Button circular size="tiny" icon={{ name: 'edit', size: 'large', color: 'orange' }} />} content="Edit course" />
                </Link>
              </Table.Cell>
            </Table.Row>
          </Table.Header>
        </Table>
      </div>
    )
  }

  let renderTeacherBottomPart = () => {
    // Fetched here because it's used in multiple occasions.
    const students = sortStudentArrayAlphabeticallyByDroppedValue(courseData.data)

    let droppedStudentCount = 0
    let activeStudentCount = 0

    students.forEach(student => {
      if (student.dropped) {
        droppedStudentCount++
      } else {
        activeStudentCount++
      }
    })

    const totalStudentCount = activeStudentCount + droppedStudentCount

    const dropConvertButton = droppedTagExists() && (
      <Button onClick={() => markAllWithDroppedTagAsDropped(courseData)} size="small">
        Mark all with dropped tag as dropped out
      </Button>
    )
    return (
      <div className="TeachersBottomView">
        <br />
        <Header as="h2">Students</Header>

        <p>
          {activeStudentCount} active student{activeStudentCount === 1 ? '' : 's'}, {droppedStudentCount} dropped student{droppedStudentCount === 1 ? '' : 's'} ({totalStudentCount} in total)
        </p>

        <StudentTable
          key={'studentTable'}
          columns={['select', 'points', 'instructor']}
          allowModify={true}
          allowReview={true}
          selectedInstance={selectedInstance}
          studentInstances={students}
          coursePageLogic={coursePageLogic}
          tags={tags}
          persistentFilterKey={`CoursePage_filters_${courseId}`}
        />
        <br />
        {dropConvertButton}
        {
          <Link to={`/labtool/massemail/${selectedInstance.ohid}`}>
            <Button size="small">Send email to multiple students</Button>
          </Link>
        }
      </div>
    )
  }

  const renderTeacherBulkForm = () => {
    const numSelected = Object.keys(coursePageLogic.selectedStudents).length
    const disabled = numSelected < 1

    return (
      <span className="TeacherBulkForm" style={{ position: 'fixed', bottom: 0, background: 'rgba(255,255,255,0.9)', textAlign: 'center', left: 0, right: 0 }}>
        <Accordion>
          <Accordion.Title style={{ background: '#f0f0f0' }} active={state.showMassAssignForm} index={0} onClick={() => (state.showMassAssignForm = !state.showMassAssignForm)}>
            <Icon size="big" name={state.showMassAssignForm ? 'caret down' : 'caret up'} />
            <h4 style={{ display: 'inline' }}>Modify selected students</h4> ({numSelected > 0 ? <b>{numSelected} selected</b> : <span>{numSelected} selected</span>})
          </Accordion.Title>
          <Accordion.Content active={state.showMassAssignForm}>
            <br />
            <Grid columns={2} divided style={{ width: '90%', display: 'inline-block' }}>
              <Grid.Row>
                <Grid.Column>
                  <Dropdown id="tagDropdown" style={{ float: 'left' }} options={dropDownTags} onChange={changeSelectedTag()} placeholder="Choose tag" fluid selection />
                </Grid.Column>
                <Grid.Column>
                  <div className="two ui buttons" style={{ float: 'left' }}>
                    <button className="ui icon positive button" disabled={disabled} onClick={() => bulkAddTag()} size="mini">
                      <i className="plus icon" />
                    </button>
                    <div className="or" />
                    <button className="ui icon button" disabled={disabled} onClick={() => bulkRemoveTag()} size="mini">
                      <i className="trash icon" />
                    </button>
                  </div>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Dropdown id="assistantDropdown" options={dropDownTeachers} onChange={changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
                </Grid.Column>
                <Grid.Column>
                  <Button disabled={disabled} onClick={() => bulkUpdateTeacher()} size="small">
                    Change instructor
                  </Button>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row>
                <Grid.Column>
                  <Button disabled={disabled} onClick={() => bulkMarkNotDropped()}>
                    Mark as non-dropped
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button disabled={disabled} color="red" onClick={() => bulkMarkDropped()}>
                    Mark as dropped
                  </Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <br />
            <br />
          </Accordion.Content>
        </Accordion>
        <br />
      </span>
    )
  }

  /**
   * Function that returns what students should see at the top of this page
   */
  let renderStudentTopPart = () => {
    return (
      <div className="StudentsView" style={{ textAlignVertical: 'center', textAlign: 'center' }}>
        <CoursePageHeader courseInstance={selectedInstance} />
        <div className="grid">
          {selectedInstance.active === true ? (
            courseData.data !== null ? (
              <p />
            ) : selectedInstance.registrationAtWebOodi === 'notfound' ? (
              <div className="sixteen wide column">
                <Message compact>
                  <Message.Header>No registration found at WebOodi.</Message.Header>
                  <p>If you have just registered, please try again in two hours.</p>
                </Message>
              </div>
            ) : (
              <div className="sixteen wide column">
                <Link to={`/labtool/courseregistration/${selectedInstance.ohid}`}>
                  {' '}
                  <Button color="blue" size="large">
                    Register
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="sixteen wide column">
              <Message compact>
                <Message.Header>This course does not have active registration.</Message.Header>
              </Message>
            </div>
          )}
        </div>
      </div>
    )
  }

  /**
   * This part actually tells what to show to the user
   */
  if (props.courseData.role === 'student') {
    return (
      <div key>
        {renderStudentTopPart()}
        {renderStudentBottomPart()}
      </div>
    )
  } else if (props.courseData.role === 'teacher') {
    return (
      <div style={{ overflowX: 'auto', overflowY: 'hidden', marginBottom: '20em' }}>
        {renderTeacherTopPart()}
        {renderTeacherBottomPart()}
        <br />
        {renderTeacherBulkForm()}
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
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  unTagStudent: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  updateStudentProjectInfo: PropTypes.func.isRequired,
  associateTeacherToStudent: PropTypes.func.isRequired,
  selectTag: PropTypes.func.isRequired,
  selectTeacher: PropTypes.func.isRequired,
  changeCourseField: PropTypes.func.isRequired,
  modifyOneCI: PropTypes.func.isRequired
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
