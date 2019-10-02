import React from 'react'
import { Button, Icon, Table, Form, Popup, Dropdown, Label } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import HorizontalScrollable from './HorizontalScrollable'
import { getAllTags, tagStudent, unTagStudent } from '../services/tags'
import { associateTeacherToStudent } from '../services/assistant'
import { showAssistantDropdown, showTagDropdown, filterByTag, filterByAssistant, selectTeacher, selectTag } from '../reducers/coursePageLogicReducer'

const { Fragment } = React

export class StudentTable extends React.Component {
  createDropdownTeachers = array => {
    if (this.props.selectedInstance.teacherInstances !== undefined) {
      array.push({
        key: '-',
        text: '(unassigned)',
        value: '-'
      })
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

  createDropdownTags = array => {
    if (this.props.tags.tags !== undefined) {
      this.props.tags.tags.map(tag =>
        array.push({
          key: tag.id,
          text: tag.name,
          value: tag.id
        })
      )
      return array
    }
    return []
  }

  updateTeacher = id => async e => {
    try {
      e.preventDefault()
      let teacherId = this.props.coursePageLogic.selectedTeacher
      if (teacherId == '-') {
        // unassign
        teacherId = null
      }

      const data = {
        studentInstanceId: id,
        teacherInstanceId: teacherId
      }
      await this.props.associateTeacherToStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  changeSelectedTeacher = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTeacher(value)
    }
  }

  changeSelectedTag = () => {
    return (e, data) => {
      const { value } = data
      this.props.selectTag(value)
    }
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

  addTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: this.props.coursePageLogic.selectedTag
      }
      await this.props.tagStudent(data)
    } catch (error) {
      console.error(error)
    }
  }

  removeTag = id => async e => {
    try {
      e.preventDefault()
      const data = {
        studentId: id,
        tagId: this.props.coursePageLogic.selectedTag
      }
      await this.props.unTagStudent(data)
    } catch (error) {
      console.error(error)
    }
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

  createHeadersTeacher = () => {
    const headers = []
    let i = 0
    for (; i < this.props.selectedInstance.weekAmount; i++) {
      headers.push(
        <Table.HeaderCell key={i}>
          Week<br />
          {i + 1}{' '}
        </Table.HeaderCell>
      )
    }
    for (var ii = 1; ii <= this.props.selectedInstance.amountOfCodeReviews; ii++) {
      headers.push(
        <Table.HeaderCell key={i + ii}>
          Code<br />Review<br />
          {ii}{' '}
        </Table.HeaderCell>
      )
    }
    if (this.props.selectedInstance.finalReview) {
      headers.push(
        <Table.HeaderCell key={i + ii + 1}>
          Final<br />Review{' '}
        </Table.HeaderCell>
      )
    }
    return headers
  }

  createIndents = (weeks, codeReviews, siId) => {
    const cr =
      codeReviews &&
      codeReviews.reduce((a, b) => {
        return { ...a, [b.reviewNumber]: b.points }
      }, {})
    const indents = []
    let i = 0
    let finalPoints = undefined
    for (; i < this.props.selectedInstance.weekAmount; i++) {
      let pushattava = (
        <Table.Cell key={i}>
          <p>-</p>
        </Table.Cell>
      )

      for (var j = 0; j < weeks.length; j++) {
        if (i + 1 === weeks[j].weekNumber) {
          pushattava = (
            <Table.Cell key={i}>
              <p>{weeks[j].points}</p>
            </Table.Cell>
          )
        } else if (weeks[j].weekNumber === this.props.selectedInstance.weekAmount + 1) {
          finalPoints = weeks[j].points
        }
      }
      indents.push(pushattava)
    }

    let ii = 0
    const { amountOfCodeReviews } = this.props.selectedInstance
    if (amountOfCodeReviews) {
      for (let index = 1; index <= amountOfCodeReviews; index++) {
        indents.push(<Table.Cell key={siId + index}>{cr[index] || cr[index] === 0 ? <p className="codeReviewPoints">{cr[index]}</p> : <p>-</p>}</Table.Cell>)
      }
    }
    // codeReviews.forEach(cr => {
    //   indents.push(<Table.Cell key={i + ii}>{cr.points !== null ? <p className="codeReviewPoints">{cr.points}</p> : <p>-</p>}</Table.Cell>)
    //   ii++
    // // })
    // while (ii < numberOfCodeReviews) {
    //   indents.push(
    //     <Table.Cell key={i + ii}>
    //       <p>-</p>
    //     </Table.Cell>
    //   )
    //   ii++
    // }

    if (this.props.selectedInstance.finalReview) {
      let finalReviewPointsCell = (
        <Table.Cell key={i + ii + 1}>
          <p>{finalPoints === undefined ? '-' : finalPoints}</p>
        </Table.Cell>
      )
      indents.push(finalReviewPointsCell)
    }

    return indents
  }

  createStudentTableRow = (showColumn, data, rowClassName, dropDownTags, dropDownTeachers) => (
    <Table.Row key={data.id} className={rowClassName}>
      {/* Send? */}
      {showColumn('sendcheck') && (
        <Table.Cell>
          <Form.Checkbox name={'send' + data.id} />
        </Table.Cell>
      )}

      {/* Student */}
      <Table.Cell>
        {data.User.firsts} {data.User.lastname} ({data.User.studentNumber})
      </Table.Cell>

      {/* Project Info */}
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
          {this.props.allowModify && (
            <Popup trigger={<Icon id="tag" onClick={this.changeHiddenTagDropdown(data.id)} name="pencil" color="green" style={{ float: 'right', fontSize: '1.25em' }} />} content="Add or remove tag" />
          )}
        </span>
        {this.props.allowModify && (
          <div>
            {this.props.coursePageLogic.showTagDropdown === data.id ? (
              <div>
                <Dropdown id="tagDropdown" style={{ float: 'left' }} options={dropDownTags} onChange={this.changeSelectedTag()} placeholder="Choose tag" fluid selection />
                <br />
                <div className="two ui buttons" style={{ float: 'left' }}>
                  <button className="ui icon positive button" onClick={this.addTag(data.id)} size="mini">
                    <i className="plus icon" />
                  </button>
                  <div className="or" />
                  <button className="ui icon button" onClick={this.removeTag(data.id)} size="mini">
                    <i className="trash icon" />
                  </button>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </Table.Cell>

      {showColumn('points') && (
        <Fragment>
          {/* Week #, Code Review # */}
          {this.createIndents(data.weeks, data.codeReviews, data.id)}

          {/* Sum */}
          <Table.Cell>
            {(data.weeks.map(week => week.points).reduce((a, b) => a + b, 0) + data.codeReviews.map(cr => cr.points).reduce((a, b) => a + b, 0)).toFixed(2).replace(/[.,]00$/, '')}
          </Table.Cell>
        </Fragment>
      )}

      {/* Instructor */}
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
        {this.props.allowModify && (
          <Fragment>
            <Popup
              trigger={<Button circular onClick={this.changeHiddenAssistantDropdown(data.id)} size="small" icon={{ name: 'pencil' }} style={{ margin: '0.25em', float: 'right' }} />}
              content="Assign instructor"
            />
            {this.props.coursePageLogic.showAssistantDropdown === data.id ? (
              <div>
                <Dropdown id="assistantDropdown" options={dropDownTeachers} onChange={this.changeSelectedTeacher()} placeholder="Select teacher" fluid selection />
                <Button onClick={this.updateTeacher(data.id, data.teacherInstanceId)} size="small">
                  Change instructor
                </Button>
              </div>
            ) : (
              <div />
            )}
          </Fragment>
        )}
      </Table.Cell>

      {showColumn('review') && (
        <Fragment>
          {/* Review */}
          <Table.Cell textAlign="right">
            <Link to={`/labtool/browsereviews/${this.props.selectedInstance.ohid}/${data.id}`}>
              <Popup trigger={<Button circular size="tiny" icon={{ name: 'star', size: 'large', color: 'orange' }} />} content="Review student" />
            </Link>
          </Table.Cell>
        </Fragment>
      )}
    </Table.Row>
  )

  render() {
    const { columns, filterStudents, rowClassName, disableDefaultFilter } = this.props

    const showColumn = column => columns.indexOf(column) >= 0

    let dropDownTeachers = []
    dropDownTeachers = this.createDropdownTeachers(dropDownTeachers)
    let dropDownFilterTeachers = [
      {
        key: 0,
        text: 'no filter',
        value: 0
      }
    ]
    dropDownFilterTeachers = this.createDropdownTeachers(dropDownFilterTeachers)

    let dropDownTags = []
    dropDownTags = this.createDropdownTags(dropDownTags)

    return (
      <Fragment>
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

        <HorizontalScrollable>
          <Table celled compact unstackable singleLine style={{ overflowX: 'visible' }}>
            <Table.Header>
              <Table.Row>
                {showColumn('sendcheck') && <Table.HeaderCell key={-2}>Send?</Table.HeaderCell>}
                <Table.HeaderCell key={-1}>Student</Table.HeaderCell>
                <Table.HeaderCell>Project Info</Table.HeaderCell>
                {showColumn('points') && (
                  <Fragment>
                    {this.createHeadersTeacher() /* Week #, Code Review # */}
                    <Table.HeaderCell>Sum</Table.HeaderCell>
                  </Fragment>
                )}
                <Table.HeaderCell width="six">Instructor</Table.HeaderCell>
                {showColumn('review') && <Table.HeaderCell>Review</Table.HeaderCell>}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {this.props.courseData && this.props.courseData.data ? (
                this.props.courseData.data
                  // remove special filter
                  .filter(data => !filterStudents || filterStudents(data))
                  // remove students when filtering assistants and it doesn't match
                  .filter(data => disableDefaultFilter || this.props.coursePageLogic.filterByAssistant === 0 || this.props.coursePageLogic.filterByAssistant === data.teacherInstanceId || (this.props.coursePageLogic.filterByAssistant === '-' && data.teacherInstanceId === null))
                  // remove students when filtering tags and they don't match
                  .filter(data => disableDefaultFilter || this.props.coursePageLogic.filterByTag.length === 0 || this.hasFilteringTags(data.Tags, this.props.coursePageLogic.filterByTag))
                  .map(data => this.createStudentTableRow(showColumn, data, rowClassName, dropDownTags, dropDownTeachers))
              ) : (
                <p />
              )}
            </Table.Body>
          </Table>
        </HorizontalScrollable>
      </Fragment>
    )
  }
}

const mapDispatchToProps = {
  associateTeacherToStudent,
  showAssistantDropdown,
  showTagDropdown,
  selectTeacher,
  selectTag,
  filterByAssistant,
  filterByTag,
  getAllTags,
  tagStudent,
  unTagStudent
}

export default connect(
  null,
  mapDispatchToProps
)(StudentTable)
