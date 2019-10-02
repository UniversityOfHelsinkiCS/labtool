import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Header, Loader } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { getAllTags } from '../../services/tags'
import { sendMassEmail } from '../../services/email'
import { coursePageReset, restoreStudentSelection } from '../../reducers/coursePageLogicReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'
import StudentTable from '../StudentTable'

export const MassEmailPage = props => {
  useEffect(() => {
    // run on component mount
    props.resetLoading()
    props.getOneCI(props.courseId)
    props.coursePageInformation(props.courseId)
    props.getAllTags()

    // do not carry over selection changes back to main student table
    const oldSelectedStudents = { ...props.coursePageLogic.selectedStudents }
    return () => {
      // run on component unmount
      props.coursePageReset()
      props.restoreStudentSelection(oldSelectedStudents)
    }
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    const data = props.courseData && props.courseData.data
    if (data) {
      const sendingTo = data.filter(entry => props.coursePageLogic.selectedStudents[entry.id]).map(entry => ({ id: entry.id }))

      if (!sendingTo.length) {
        store.dispatch({ type: 'MASS_EMAIL_SENDFAILURE' })
      } else {
        props.addRedirectHook({
          hook: 'MASS_EMAIL_SEND'
        })
        await props.sendMassEmail({ students: sendingTo, content: e.target.content.value, sendToInstructors: e.target.sendToInstructors.checked }, props.selectedInstance.ohid)
      }
    }
  }

  if (props.loading.loading) {
    return <Loader active />
  }
  if (props.loading.redirect) {
    return <Redirect to={`/labtool/courses/${props.selectedInstance.ohid}`} />
  }

  /**
   * Function that returns what teachers should see at this page
   * We will use a form to decide which students to send an email
   * and what exactly to send
   */
  let renderTeacherPart = () => {
    return (
      <div className="TeacherMassEmailPart">
        <Header as="h2">Send email to students </Header>

        <Form onSubmit={handleSubmit}>
          <StudentTable
            rowClassName="TableRowForActiveStudents"
            columns={['select']}
            allowModify={false}
            filterStudents={data => data.User.email}
            disableDefaultFilter={false}
            selectedInstance={props.selectedInstance}
            courseData={props.courseData}
            coursePageLogic={props.coursePageLogic}
            tags={props.tags}
          />

          <br />
          <br />

          <Form.TextArea name="content" placeholder="Type email here..." defaultValue="" required />
          <Form.Checkbox name="sendToInstructors" defaultChecked={true} label="Send a copy to all instructors" />
          <Button type="submit" className="ui green button" content="Send" />

          <br />
          <br />

          <Link to={`/labtool/courses/${props.selectedInstance.ohid}`}>
            <Button className="ui button" type="cancel">
              Cancel
            </Button>
          </Link>
        </Form>
        <br />
      </div>
    )
  }

  /**
   * This part actually tells what to show to the user
   */
  if (props.courseData.role === 'teacher') {
    return (
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        {renderTeacherPart()}
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    )
  } else {
    return <div />
  }
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
  sendMassEmail,
  resetLoading,
  addRedirectHook,
  restoreStudentSelection
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

  getOneCI: PropTypes.func.isRequired,
  coursePageInformation: PropTypes.func.isRequired,
  coursePageReset: PropTypes.func.isRequired,
  getAllTags: PropTypes.func.isRequired,
  sendMassEmail: PropTypes.func.isRequired,
  resetLoading: PropTypes.func.isRequired,
  addRedirectHook: PropTypes.func.isRequired,
  restoreStudentSelection: PropTypes.func.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MassEmailPage)
