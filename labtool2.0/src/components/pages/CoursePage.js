import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Table, Card, Input, Form, Comment, Header, Label, Message, Icon, Popup, Loader, Dropdown, Grid } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation, modifyOneCI } from '../../services/courseInstance'
import ReactMarkdown from 'react-markdown'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { associateTeacherToStudent } from '../../services/assistant'
import { addLinkToCodeReview } from '../../services/codeReview'
import { sendEmail } from '../../services/email'
import { coursePageReset, updateActiveIndex, toggleCodeReview, selectTag, selectTeacher } from '../../reducers/coursePageLogicReducer'
import { changeCourseField } from '../../reducers/selectedInstanceReducer'
import { updateStudentProjectInfo } from '../../services/studentinstances'
import { resetLoading } from '../../reducers/loadingReducer'
import { usePersistedState } from '../../hooks/persistedState'

import LabtoolComment from '../LabtoolComment'
import LabtoolAddComment from '../LabtoolAddComment'
import StudentTable from '../StudentTable'
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

  const sortArrayAscendingByDate = theArray => {
    return theArray.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }

  const sortStudentArrayAlphabeticallyByDroppedValue = theArray => {
    return theArray.sort((a, b) => {
      if (a.dropped !== b.dropped) {
        return Number(a.dropped) - Number(b.dropped)
      } else {
        return a.lastname > b.lastname ? -1 : 1
      }
    })
  }

  const handleClick = (e, titleProps) => {
    const { index } = titleProps
    const theNewIndex = props.coursePageLogic.activeIndex === index ? -1 : index
    props.updateActiveIndex(theNewIndex)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const content = {
      hidden: false,
      comment: e.target.content.value,
      week: parseInt(e.target.name, 10),
      from: props.user.user.username
    }
    document.getElementById(e.target.name).reset()
    try {
      await props.createOneComment(content)
      document.getElementById('comment').reset()
    } catch (error) {
      console.log(error)
    }
  }

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

  const droppedTagExists = () => {
    return props.tags.tags && props.tags.tags.map(tag => tag.name.toUpperCase()).includes('DROPPED')
  }

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

  const sendEmail = commentId => async () => {
    props.sendEmail({
      commentId,
      role: 'student'
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

  const { courseId, user, courseData, coursePageLogic, courseInstance, selectedInstance, tags } = props

  const renderComment = comment => {
    /* This hack compares user's name to comment.from and hides the email notification button when they don't match. */
    const userIsCommandSender = comment.from.includes(user.user.firsts) && comment.from.includes(user.user.lastname)

    return <LabtoolComment key={comment.id} comment={comment} allowNotify={userIsCommandSender} sendCommentEmail={sendEmail(comment.id)} />
  }

  const getMaximumPoints = week => {
    const checklist = props.selectedInstance.checklists.find(checkl => checkl.week === week)
    if (checklist === undefined || checklist.maxPoints === 0) {
      return selectedInstance.weekMaxPoints
    }
    return checklist.maxPoints
  }

  const createStudentGradedWeek = (i, week) => (
    <Accordion key={i} fluid styled>
      <Accordion.Title active={i === coursePageLogic.activeIndex} index={i} onClick={handleClick}>
        <Icon name="dropdown" />
        {i + 1 > selectedInstance.weekAmount ? <span>Final Review</span> : <span>Week {week.weekNumber}</span>}, points {week.points} / {getMaximumPoints(week.weekNumber)}
      </Accordion.Title>
      <Accordion.Content active={i === coursePageLogic.activeIndex}>
        <Card fluid color="yellow">
          <Card.Content>
            <h4>
              {' '}
              Points {week.points} / {getMaximumPoints(week.weekNumber)}
            </h4>
            <h4> Feedback </h4>
            <ReactMarkdown>{week.feedback}</ReactMarkdown>{' '}
          </Card.Content>
        </Card>
        <h4> Comments </h4>
        <Comment.Group>{week ? sortArrayAscendingByDate(week.comments).map(renderComment) : <h4> No comments </h4>}</Comment.Group>
        <LabtoolAddComment weekId={week.id} commentFieldId={`${courseId}:${week.id}`} handleSubmit={handleSubmit} />
      </Accordion.Content>
    </Accordion>
  )

  const createStudentUngradedWeek = i => (
    <Accordion key={i} fluid styled>
      <Accordion.Title active={coursePageLogic.activeIndex === i} index={i} onClick={handleClick}>
        <Icon name="dropdown" /> {i + 1 > selectedInstance.weekAmount ? <span>Final Review</span> : <span>Week {i + 1}</span>}
      </Accordion.Title>
      <Accordion.Content active={coursePageLogic.activeIndex === i}>
        <h4> Not Graded </h4>
        <h4> No comments </h4>
      </Accordion.Content>
    </Accordion>
  )

  const createStudentCodeReview = (i, cr) => (
    <Accordion key={i} fluid styled>
      <Accordion.Title className="codeReview" active={coursePageLogic.activeIndex === i || cr.points === null} index={i} onClick={handleClick}>
        <Icon name="dropdown" /> Code Review {cr.reviewNumber} {cr.points !== null ? ', points ' + cr.points : ''}
      </Accordion.Title>
      <Accordion.Content active={coursePageLogic.activeIndex === i || cr.points === null}>
        <div className="codeReviewExpanded">
          <div className="codeReviewPoints">
            <strong>Points: </strong> {cr.points !== null ? cr.points : 'Not graded yet'}
            {/* <br /> <br /> */}
            {/* <strong>Project to review: </strong>
            {cr.toReview.projectName || } */}
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
          </div>

          {coursePageLogic.showCodeReviews.indexOf(cr.reviewNumber) !== -1 ? (
            <div>
              {cr.linkToReview ? (
                <div />
              ) : (
                <div>
                  <strong>Link your review here:</strong> <br />
                  <Form onSubmit={handleAddingIssueLink(cr.reviewNumber, courseData.data.id)}>
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
        </div>
      </Accordion.Content>
    </Accordion>
  )

  const renderStudentBottomPart = () => {
    let headers = []
    // studentInstance is id of student. Type: String
    // Tämä pitää myös korjata.

    // student's own details.
    headers.push(
      <div key="student info">
        {courseData && courseData.data && courseData.data.User ? (
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
    )

    // student's week and code reviews
    if (selectedInstance && courseData && courseData.data && courseData.data.weeks) {
      let i = 0
      let week = null
      const weekMatcher = i => week => week.weekNumber === i + 1

      const howManyWeeks = selectedInstance.finalReview ? selectedInstance.weekAmount + 1 : selectedInstance.weekAmount
      for (; i < howManyWeeks; i++) {
        week = courseData.data.weeks.find(weekMatcher(i))
        headers.push(week !== undefined ? createStudentGradedWeek(i, week) : createStudentUngradedWeek(i))
      }

      courseData.data.codeReviews
        .sort((a, b) => {
          return a.reviewNumber - b.reviewNumber
        })
        .forEach(cr => {
          headers.push(createStudentCodeReview(i, cr))
          i++
        })

      headers.push(
        <Accordion key="total" fluid styled style={{ marginBottom: '2em' }}>
          <Accordion.Title active={true} index="total">
            <Icon name="check" />
            <strong> Total Points: </strong>
            {(
              courseData.data.weeks
                .map(week => week.points)
                .reduce((a, b) => {
                  return a + b
                }, 0) +
              courseData.data.codeReviews
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

    return headers
  }

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
                  trigger={<Icon disabled={!weekAdvanceEnabled} name="right arrow" onClick={() => moveToNextWeek()} style={{ marginLeft: '15px', cursor: weekAdvanceEnabled ? 'pointer' : 'hand' }} />}
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
          <Accordion.Title fluid style={{ background: '#f0f0f0' }} active={state.showMassAssignForm} index={0} onClick={() => (state.showMassAssignForm = !state.showMassAssignForm)}>
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

  createOneComment: PropTypes.func.isRequired,
  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  addLinkToCodeReview: PropTypes.func.isRequired,
  coursePageReset: PropTypes.func.isRequired,
  toggleCodeReview: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  tagStudent: PropTypes.func.isRequired,
  sendEmail: PropTypes.func.isRequired,
  updateActiveIndex: PropTypes.func.isRequired,
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
  createOneComment,
  getOneCI,
  coursePageInformation,
  addLinkToCodeReview,
  coursePageReset,
  toggleCodeReview,
  getAllTags,
  tagStudent,
  sendEmail,
  updateActiveIndex,
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
