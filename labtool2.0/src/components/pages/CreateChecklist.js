import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Header, Input, Label, Button, Popup, Card } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI } from '../../services/courseInstance'
import { resetChecklist, changeField, addTopic, addRow, removeTopic, removeRow, castPointsToNumber } from '../../reducers/checklistReducer'
import './CreateChecklist.css'

export class CreateChecklist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      week: 1, // tracks value of input labeled week
      topicName: '', // tracks value inputted into topic creation dialog box.
      rowName: '', // tracks value inputted into row creation dialog box.
      openAdd: '', // which addForm is currently open. '' denotes no open addForms. Only one addForm can be open at one time.
      dullLoadButton: 0 // Tracks which week was loaded last.
    }
  }

  componentWillMount() {
    this.props.resetChecklist()
    this.props.getOneCI(this.props.courseId)
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

  changeWeek = async e => {
    const week = Number(e.target.value)
    const weeks = this.props.selectedInstance.weekAmount
    const checklists = this.props.selectedInstance.finalReview ? weeks + 1 : weeks
    if (week <= 0 || week > checklists) {
      this.props.showNotification({
        message: 'Invalid week.',
        error: true
      })
      // Allow week to be changed into an invalid value to avoid confusing users.
    }
    this.setState({
      week
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
  loadChecklist = async e => {
    this.setState({
      dullLoadButton: this.state.week
    })
    this.props.getOneChecklist({
      week: this.state.week,
      courseInstanceId: this.props.selectedInstance.id
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

  render() {
    return (
      <div className="CreateChecklist">
        <Header>{this.props.selectedInstance.name}</Header>
        <div className="editForm">
          <div className="topOptions">
            <Label>Week </Label>
            <Input type="number" name="week" step="1" value={this.state.week} onChange={this.changeWeek} style={{ width: '100px', marginRight: '10px' }} />
            <Button className="loadButton" type="button" onClick={this.loadChecklist} color={this.state.dullLoadButton === this.state.week ? undefined : 'green'}>
              Load checklist
            </Button>
          </div>
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
                        step="0.25"
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
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    selectedInstance: state.selectedInstance,
    checklist: state.checklist
  }
}

const mapDispatchToProps = {
  showNotification,
  createChecklist,
  getOneCI,
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
