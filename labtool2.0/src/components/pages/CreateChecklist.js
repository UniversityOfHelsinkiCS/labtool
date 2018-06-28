import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Header, Input, Label, Button, Popup, Card, Dropdown } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI, getAllCI } from '../../services/courseInstance'
import { resetChecklist, changeField, addTopic, addRow, removeTopic, removeRow, castPointsToNumber } from '../../reducers/checklistReducer'
import './CreateChecklist.css'

export class CreateChecklist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      week: undefined, // tracks value of week dropdown
      copyCourse: undefined, // tracks value of course dropdown
      topicName: '', // tracks value inputted into topic creation dialog box.
      rowName: '', // tracks value inputted into row creation dialog box.
      openAdd: '' // which addForm is currently open. '' denotes no open addForms. Only one addForm can be open at one time.
    }
  }

  componentWillMount() {
    this.props.resetChecklist()
    this.props.getAllCI()
  }

  // Make api call to save checklist to database.
  handleSubmit = async e => {
    e.preventDefault()
    const weeks = this.props.selectedInstance.weekAmount
    const checklists = this.props.selectedInstance.finalReview ? weeks + 1 : weeks
    if (this.state.week <= 0 || this.state.week > checklists) {
      this.props.showNotification({
        message: 'Invalid week.',
        error: true
      })
      return
    }
    try {
      this.props.createChecklist({
        courseInstanceId: this.props.selectedInstance.id,
        week: this.state.week,
        checklist: this.props.checklist.data
      })
    } catch (e) {
      this.props.showNotification({
        message: 'Could not parse JSON.',
        error: true
      })
    }
  }

  changeWeek = async (e, { value }) => {
    const week = value
    let copyCourse
    if (this.state.copyCourse) {
      copyCourse = this.props.courses.find(course => course.id === this.state.copyCourse).weekAmount >= week ? this.state.copyCourse : undefined
    } else {
      copyCourse = undefined
    }
    this.setState({
      week,
      copyCourse
    })
    this.loadChecklist(week)
  }

  changeCopyCourse = async (e, { value }) => {
    const copyCourse = value
    this.setState({
      copyCourse
    })
  }

  changeField = (key, name, field) => async e => {
    this.props.changeField({
      key,
      name,
      field,
      value: e.target.value
    })
  }

  // Make api call to receive checklist from database.
  loadChecklist = async week => {
    this.props.getOneChecklist({
      week,
      courseInstanceId: this.props.selectedInstance.id
    })
  }

  copyChecklist = async e => {
    const week = this.state.week > this.props.selectedInstance.weekAmount ? this.props.courses.find(course => course.id === this.state.copyCourse).weekAmount + 1 : this.state.week
    this.props.getOneChecklist({
      week,
      courseInstanceId: this.state.copyCourse,
      copying: true
    })
  }

  /**
   * First call opens a dialog box.
   * Subsequent call actually adds the new topic.
   */
  newTopic = async e => {
    e.preventDefault()
    if (this.state.openAdd !== 'newTopic') {
      this.setState({
        openAdd: 'newTopic'
      })
      return
    }
    if (this.state.topicName === '') {
      this.props.showNotification({
        message: 'Topic name cannot be blank.',
        error: true
      })
      return
    }
    this.props.addTopic({
      key: this.state.topicName
    })
    this.setState({
      topicName: '',
      openAdd: ''
    })
  }

  /**
   * First call opens a dialog box.
   * Subsequent call actually adds the new row.
   */
  newRow = key => async e => {
    e.preventDefault()
    if (this.state.openAdd !== key) {
      this.setState({
        openAdd: key
      })
      return
    }
    if (this.state.rowName === '') {
      this.props.showNotification({
        message: 'Checkbox name cannot be blank.',
        error: true
      })
      return
    }
    this.props.addRow({
      key,
      name: this.state.rowName
    })
    this.setState({
      rowName: '',
      openAdd: ''
    })
  }

  changeTopicName = async e => {
    this.setState({
      topicName: e.target.value
    })
  }

  changeRowName = async e => {
    this.setState({
      rowName: e.target.value
    })
  }

  removeTopic = key => async e => {
    this.props.removeTopic({
      key
    })
  }

  removeRow = (key, name) => async e => {
    this.props.removeRow({
      key,
      name
    })
  }

  cancelAdd = async e => {
    this.setState({
      openAdd: ''
    })
  }

  castPointsToNumber = (key, name) => async e => {
    this.props.castPointsToNumber({
      key,
      name
    })
  }

  weekFilter = courses => {
    return courses.filter(course => this.state.week <= course.weekAmount)
  }
  finalFilter = courses => {
    return courses.filter(course => course.finalReview)
  }
  createCourseDropdowns = () => {
    if (!this.props.courses || !this.props.selectedInstance) return []
    const courses = this.state.week > this.props.selectedInstance.weekAmount ? this.finalFilter(this.props.courses) : this.weekFilter(this.props.courses)
    const options = courses.filter(course => this.props.selectedInstance.id !== course.id).map(course => {
      return {
        value: course.id,
        text: `${course.name} (${course.europeanStart})`
      }
    })
    console.log(options)
    return options
  }

  render() {
    return (
      <div className="CreateChecklist">
        <Header>{this.props.selectedInstance.name}</Header>
        <div className="editForm">
          <div className="topOptions">
            <Dropdown placeholder="Select Checklist" selection value={this.state.week} onChange={this.changeWeek} options={this.props.weekDropdowns} />
            <div className="copyForm">
              <Button type="button" onClick={this.copyChecklist}>
                Copy
              </Button>
              <Dropdown placeholder="Copy checklist from another course" selection value={this.state.copyCourse} onChange={this.changeCopyCourse} options={this.createCourseDropdowns()} />
            </div>
          </div>
          {this.state.week !== undefined ? (
            <div>
              <div>
                {Object.keys(this.props.checklist.data).map(key => (
                  <Card fluid color="red" key={key}>
                    <Card.Content>
                      <Header>
                        {key}{' '}
                        <Button className="deleteButton" type="button" color="red" size="tiny" onClick={this.removeTopic(key)}>
                          <div className="deleteButtonText">Delete topic</div>
                        </Button>
                      </Header>
                    </Card.Content>
                    {this.props.checklist.data[key].map(row => (
                      <Card.Content key={row.name}>
                        <Header>
                          {row.name}{' '}
                          <Button className="deleteButton" type="button" color="red" size="tiny" onClick={this.removeRow(key, row.name)}>
                            <div className="deleteButtonText">Delete checkbox</div>
                          </Button>
                        </Header>
                        <div className="formField">
                          <Label>Points</Label>
                          <Input
                            className="numberField"
                            type="number"
                            step="0.01"
                            value={row.points}
                            onChange={this.changeField(key, row.name, 'points')}
                            onBlur={this.castPointsToNumber(key, row.name)}
                          />
                        </div>
                        <div className="formField">
                          <Label>Text when checked</Label>
                          <Input className="textField" type="text" value={row.textWhenOn} onChange={this.changeField(key, row.name, 'textWhenOn')} />
                        </div>
                        <div className="formField">
                          <Label>Text when unchecked</Label>
                          <Input className="textField" type="text" value={row.textWhenOff} onChange={this.changeField(key, row.name, 'textWhenOff')} />
                        </div>
                      </Card.Content>
                    ))}
                    <form className="addForm" onSubmit={this.newRow(key)}>
                      {/*This, like all other addForms is here to funnel both the button press 
                        as well as a user pressing enter into the same function.*/}
                      <Popup trigger={<Button type="submit" circular icon={{ name: 'add' }} />} content="Add new checkbox" />
                      {this.state.openAdd === key ? (
                        <div>
                          <Label>Name</Label>
                          <Input className="newRowNameInput" type="text" value={this.state.rowName} onChange={this.changeRowName} />
                          <Button type="button" onClick={this.cancelAdd}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div />
                      )}
                    </form>
                  </Card>
                ))}
                <form className="addForm" onSubmit={this.newTopic}>
                  <Popup trigger={<Button type="submit" circular icon={{ name: 'add', size: 'large' }} />} content="Add new topic" />
                  {this.state.openAdd === 'newTopic' ? (
                    <div>
                      <Label>Name</Label>
                      <Input className="newTopicNameInput" type="text" value={this.state.topicName} onChange={this.changeTopicName} />
                      <Button type="button" onClick={this.cancelAdd}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                </form>
              </div>
              <form onSubmit={this.handleSubmit}>
                {/*This is a form with a single button instead of just a button because it doesn't work 
                  (doesn't call the function) as just a button with onClick.*/}
                <Button className="saveButton" type="submit" color="green" size="large">
                  <div className="saveButtonText">Save</div>
                </Button>
              </form>
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    )
  }
}

const createWeekDropdowns = selectedInstance => {
  if (!selectedInstance) return []
  const options = []
  let week = 1
  while (week <= selectedInstance.weekAmount) {
    options.push({
      value: week,
      text: `Week ${week}`
    })
    week++
  }
  if (selectedInstance.finalReview) {
    options.push({
      value: week,
      text: 'Final Review'
    })
  }
  return options
}

const mapStateToProps = (state, ownProps) => {
  const selectedInstance = state.courseInstance.find(course => course.ohid === ownProps.courseId)
  return {
    selectedInstance: selectedInstance || {},
    weekDropdowns: createWeekDropdowns(selectedInstance),
    checklist: state.checklist,
    courses: state.courseInstance
  }
}

const mapDispatchToProps = {
  showNotification,
  createChecklist,
  getOneCI,
  getAllCI,
  getOneChecklist,
  resetChecklist,
  changeField,
  addTopic,
  addRow,
  removeTopic,
  removeRow,
  castPointsToNumber
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateChecklist)
