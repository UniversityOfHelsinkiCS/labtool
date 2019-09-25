import React from 'react'
import { Button, Table, Form, Header, Label, Dropdown, Loader } from 'semantic-ui-react'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { createOneComment } from '../../services/comment'
import { getOneCI, coursePageInformation } from '../../services/courseInstance'
import { associateTeacherToStudent } from '../../services/assistant'
import { getAllTags, tagStudent, unTagStudent } from '../../services/tags'
import { addLinkToCodeReview } from '../../services/codeReview'
import { sendMassEmail } from '../../services/email'
import {
  showAssistantDropdown,
  showTagDropdown,
  filterByTag,
  filterByAssistant,
  updateActiveIndex,
  selectTeacher,
  selectTag,
  coursePageReset,
  toggleCodeReview
} from '../../reducers/coursePageLogicReducer'
import { resetLoading, addRedirectHook } from '../../reducers/loadingReducer'
import store from '../../store'
import { HorizontalScrollable } from '../HorizontalScrollable'

export class MassEmailPage extends React.Component {
  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const theNewIndex = this.props.coursePageLogic.activeIndex === index ? -1 : index
    this.props.updateActiveIndex(theNewIndex)
  }

  componentWillMount = async () => {
    await this.props.resetLoading()
    this.props.getOneCI(this.props.courseId)
    this.props.coursePageInformation(this.props.courseId)
    this.props.getAllTags()
  }

  componentWillUnmount() {
    this.props.coursePageReset()
  }

  sortArrayAscendingByDate = theArray => {
    return theArray.sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }

  changeHiddenAssistantDropdown = id => {
    return () => {
      this.props.showAssistantDropdown(this.props.coursePageLogic.showAssistantDropdown === id ? '' : id)
    }
  }

  changeHiddenTagDropdown = id => {
    return () => {
      this.props.showTagDropdown(this.props.coursePageLogic.showTagDropdown === id ? '' : id)
    }
  }

  changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTag(value)
    }
  }

  handleAddingIssueLink = (reviewNumber, studentInstance) => async e => {
    e.preventDefault()
    const data = {
      reviewNumber,
      studentInstanceId: studentInstance,
      linkToReview: e.target.reviewLink.value
    }
    e.target.reviewLink.value = ''
    this.props.addLinkToCodeReview(data)
  }

  changeFilterAssistant = () => {
    return (e, data) => {
      const { value } = data
      this.props.filterByAssistant(value)
    }
  }

  addFilterTag = tag => {
    return () => {
      this.props.filterByTag(tag)
    }
  }

  hasFilteringTags = (studentTagsData, filteringTags) => {
    let studentInstanceTagIds = studentTagsData.map(tag => tag.id)
    let filteringTagIds = filteringTags.map(tag => tag.id)
    let hasRequiredTags = true
    for (let i = 0; i < filteringTagIds.length; i++) {
      if (!studentInstanceTagIds.includes(filteringTagIds[i])) {
        hasRequiredTags = false
      }
    }
    return hasRequiredTags
  }

  createDropdownTeachers = array => {
    if (this.props.selectedInstance.teacherInstances !== undefined) {
      this.props.selectedInstance.teacherInstances.map(m =>
        array.push({
          key: m.id,
          text: m.firsts + ' ' + m.lastname,
          value: m.id
        })
      )
      return array
    }
    return []
  }

  handleSubmit = async e => {
    e.preventDefault()
    const data = this.props.courseData && this.props.courseData.data
    if (data) {
      const sendingTo = data.filter(entry => e.target['send' + entry.id] && e.target['send' + entry.id].checked).map(entry => ({ id: entry.id }))

      if (!sendingTo.length) {
        store.dispatch({ type: 'MASS_EMAIL_SENDFAILURE' })
      } else {
        this.props.addRedirectHook({
          hook: 'MASS_EMAIL_SEND'
        })
        await this.props.sendMassEmail({ students: sendingTo, content: e.target.content.value }, this.props.selectedInstance.ohid)
      }
    }
  }

  render() {
    if (this.props.loading.loading) {
      return <Loader active />
    }
    if (this.props.loading.redirect) {
      return <Redirect to={`/labtool/courses/${this.props.selectedInstance.ohid}`} />
    }

    let dropDownFilterTeachers = [
      {
        key: 0,
        text: 'no filter',
        value: 0
      },
      {
        key: null,
        text: 'unassigned students',
        value: null
      }
    ]
    dropDownFilterTeachers = this.createDropdownTeachers(dropDownFilterTeachers)

    /**
     * Function that returns what teachers should see at this page
     * We will use a form to decide which students to send an email
     * and what exactly to send
     */
    let renderTeacherPart = () => {
      return (
        <div className="TeacherMassEmailPart">
          <Header as="h2">Send email to students </Header>
          <div style={{ textAlign: 'left' }}>
            <span>Filter by instructor </span>
            <Dropdown
              options={dropDownFilterTeachers}
              onChange={this.changeFilterAssistant()}
              placeholder="Select Teacher"
              defaultValue={this.props.coursePageLogic.filterByAssistant}
              fluid
              selection
              style={{ display: 'inline' }}
            />
            <span> Tag filters: </span>
            {this.props.coursePageLogic.filterByTag.length === 0 ? (
              <span>
                <Label>none</Label>
              </span>
            ) : (
              <span>
                {this.props.coursePageLogic.filterByTag.map(tag => (
                  <span key={tag.id}>
                    <Button compact className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                      {tag.name}
                    </Button>
                  </span>
                ))}
              </span>
            )}
          </div>

          <Form onSubmit={this.handleSubmit}>
            <HorizontalScrollable>
              <Table celled compact unstackable style={{ overflowX: 'visible' }}>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell key={-1}>Send?</Table.HeaderCell>
                    <Table.HeaderCell>Student</Table.HeaderCell>
                    <Table.HeaderCell> Instructor </Table.HeaderCell>
                    <Table.HeaderCell width="six">Project Info</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.props.courseData && this.props.courseData.data ? (
                    this.props.courseData.data
                      .filter(data => {
                        return this.props.coursePageLogic.filterByAssistant === 0 || this.props.coursePageLogic.filterByAssistant === data.teacherInstanceId
                      })
                      .filter(data => {
                        return this.props.coursePageLogic.filterByTag.length === 0 || this.hasFilteringTags(data.Tags, this.props.coursePageLogic.filterByTag)
                      })
                      .map(data => (
                        <Table.Row key={data.id} className="TableRowForActiveStudents">
                          <Table.Cell>
                            <Form.Checkbox name={'send' + data.id} />
                          </Table.Cell>
                          <Table.Cell>
                            {data.User.firsts} {data.User.lastname} <small>({data.User.studentNumber})</small>
                          </Table.Cell>
                          <Table.Cell>
                            {data.teacherInstanceId && this.props.selectedInstance.teacherInstances ? (
                              this.props.selectedInstance.teacherInstances.filter(teacher => teacher.id === data.teacherInstanceId).map(teacher => (
                                <span key={data.id}>
                                  {teacher.firsts} {teacher.lastname}
                                </span>
                              ))
                            ) : (
                              <span>not assigned</span>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <span>
                              {data.projectName}
                              <br />
                              <a href={data.github} target="_blank" rel="noopener noreferrer">
                                {data.github}
                              </a>
                              {data.Tags.map(tag => (
                                <div key={tag.id}>
                                  <Button compact floated="left" className={`mini ui ${tag.color} button`} onClick={this.addFilterTag(tag)}>
                                    {tag.name}
                                  </Button>
                                </div>
                              ))}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))
                  ) : (
                    <p />
                  )}
                </Table.Body>
              </Table>
            </HorizontalScrollable>

            <br />
            <br />

            <Form.TextArea name="content" placeholder="Type email here..." defaultValue="" required />
            <Button type="submit" className="ui green button" content="Send" />

            <br />
            <br />

            <Link to={`/labtool/courses/${this.props.selectedInstance.ohid}`}>
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
    if (this.props.courseData.role === 'teacher') {
      return <div style={{ overflow: 'auto' }}>{renderTeacherPart()}</div>
    } else {
      return <div />
    }
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
  createOneComment,
  getOneCI,
  coursePageInformation,
  associateTeacherToStudent,
  addLinkToCodeReview,
  showAssistantDropdown,
  showTagDropdown,
  selectTeacher,
  selectTag,
  filterByAssistant,
  filterByTag,
  coursePageReset,
  toggleCodeReview,
  getAllTags,
  tagStudent,
  sendMassEmail,
  updateActiveIndex,
  unTagStudent,
  resetLoading,
  addRedirectHook
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MassEmailPage)
