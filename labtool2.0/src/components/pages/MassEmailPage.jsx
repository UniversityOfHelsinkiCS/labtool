import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Header, Loader, Message } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { getAllTags } from '../../services/tags'
import { sendMassEmail } from '../../services/email'
import { coursePageReset, restoreStudentSelection } from '../../reducers/coursePageLogicReducer'
import { resetLoading } from '../../reducers/loadingReducer'
import { resetMassEmail } from '../../reducers/massEmailReducer'
import store from '../../store'
import StudentTable from '../StudentTable'
import { usePersistedState, clearOnePersistedState } from '../../hooks/persistedState'
import { sortStudentsAlphabeticallyByDroppedValue } from '../../util/sort'
import DocumentTitle from '../DocumentTitle'
import Error from '../Error'

export const MassEmailPage = props => {
  const myCourseId = props.courseId
  const persistentKey = `MassEmailPage_${myCourseId}`

  const MassEmailInput = () => {
    const pstate = usePersistedState(persistentKey, {
      value: '',
      checked: true
    })

    return (
      <>
        <Form.TextArea
          name="content"
          placeholder="Type email here..."
          value={pstate.value}
          onChange={(e, { value }) => (pstate.value = value)}
          required
        />
        <Form.Checkbox
          name="sendToInstructors"
          checked={pstate.checked}
          onChange={(e, { checked }) => (pstate.checked = checked)}
          label="Send a copy to all instructors"
        />
        <Button type="submit" className="ui green button" content="Send" />
      </>
    )
  }

  const clearState = () => {
    clearOnePersistedState(persistentKey)
  }

  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.resetMassEmail()

    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getAllTags()

    // do not carry over selection changes back to main student table
    const oldSelectedStudents = { ...props.coursePageLogic.selectedStudents }

    return () => {
      // run on component unmount
      props.coursePageReset()
      props.restoreStudentSelection(oldSelectedStudents)
      props.resetMassEmail()
    }
  }, [])

  // When some recipients did not get the email, select exactly them so the email can be resent to them.
  const { notDelivered } = props.massEmail
  useEffect(() => {
    const failedStudents = notDelivered.filter(recipient => recipient.studentInstanceId)
    if (failedStudents.length > 0) {
      const selection = {}
      failedStudents.forEach(recipient => (selection[recipient.studentInstanceId] = true))
      props.restoreStudentSelection(selection)
    }
  }, [notDelivered])

  const handleSubmit = async e => {
    e.preventDefault()
    const data = (props.courseData && props.courseData.data).filter(student => student.validRegistration)
    if (data) {
      const sendingTo = data
        .filter(entry => props.coursePageLogic.selectedStudents[entry.id])
        .map(entry => ({ id: entry.id }))
      if (!sendingTo.length) {
        store.dispatch({ type: 'MASS_EMAIL_SENDFAILURE' })
      } else {
        await props.sendMassEmail(
          {
            students: sendingTo,
            content: e.target.content.value,
            sendToInstructors: e.target.sendToInstructors.checked
          },
          props.selectedInstance.ohid
        )
      }
    }
  }

  const selectAllNonDroppedStudents = () => {
    const newSelect = {}
    props.courseData.data
      .filter(student => student.validRegistration && !student.dropped)
      .forEach(student => (newSelect[student.id] = true))
    props.restoreStudentSelection(newSelect)
  }

  const documentTitle = <DocumentTitle title="Mass email" />

  if (props.errors && props.errors.length > 0) {
    return (
      <Error
        errors={props.errors.map(
          error => `${error.response.data} (${error.response.status} ${error.response.statusText})`
        )}
      />
    )
  }

  if (props.loading.loading) {
    return (
      <>
        {documentTitle}
        <Loader active />
      </>
    )
  }
  // Back to the course page only when everybody got the email; otherwise stay here (#1141).
  if (props.massEmail.done && notDelivered.length === 0) {
    clearState()
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }

  /**
   * Function that returns what teachers should see at this page
   * We will use a form to decide which students to send an email
   * and what exactly to send
   */
  const { courseData, selectedInstance, coursePageLogic, tags } = props

  if (props.courseData.role !== 'teacher') {
    return <div />
  }

  return (
    <>
      {documentTitle}
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div className="TeacherMassEmailPart">
          <Header as="h2">Send email to students </Header>

          {notDelivered.length > 0 && (
            <Message warning onDismiss={props.resetMassEmail} className="notDelivered">
              <Message.Header>
                {props.massEmail.done
                  ? 'The email was sent, but these recipients did not get it'
                  : 'The email was not sent to anybody'}
              </Message.Header>
              <Message.List>
                {notDelivered.map(({ name, email, reason }) => (
                  <Message.Item key={`${name}-${email}`}>
                    {name}
                    {email ? ` (${email})` : ''}: {reason}
                  </Message.Item>
                ))}
              </Message.List>
              <p>
                The students who did not get the email are selected below, and the message is kept. A rejected
                address has to be corrected (students can change it on My page) before sending to it again.
              </p>
            </Message>
          )}

          <Button style={{ marginBottom: '8px' }} onClick={selectAllNonDroppedStudents}>
            Select all active students
          </Button>
          <Form onSubmit={handleSubmit}>
            <StudentTable
              columns={['select', 'instructor']}
              allowModify={false}
              filterStudents={data => data.User.email && data.validRegistration}
              disableDefaultFilter={false}
              studentInstances={sortStudentsAlphabeticallyByDroppedValue(courseData.data)}
              selectedInstance={selectedInstance}
              courseData={courseData}
              coursePageLogic={coursePageLogic}
              tags={tags}
            />

            <br />
            <br />

            <MassEmailInput />

            <br />
            <br />

            <Link to={`/labtool/courses/${selectedInstance.ohid}`}>
              <Button className="ui button" type="button" onClick={clearState}>
                Cancel
              </Button>
            </Link>
          </Form>
          <br />
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  )
}

MassEmailPage.propTypes = {
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
  massEmail: PropTypes.object.isRequired,

  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  coursePageReset: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  sendMassEmail: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  resetMassEmail: PropTypes.func.isRequired,
  restoreStudentSelection: PropTypes.func.isRequired,

  errors: PropTypes.array
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
    loading: state.loading,
    massEmail: state.massEmail,
    errors: Object.values(state.loading.errors)
  }
}

const mapDispatchToProps = {
  getOneCI,
  coursePageInformation,
  coursePageReset,
  getAllTags,
  sendMassEmail,
  resetLoading,
  resetMassEmail,
  restoreStudentSelection
}

export default connect(mapStateToProps, mapDispatchToProps)(MassEmailPage)
