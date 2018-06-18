import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Header, Input, Label, Button, Popup, Card } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI } from '../../services/courseInstance'
import { resetChecklist, changeField, addTopic, addRow, removeTopic, removeRow } from '../../reducers/checklistReducer'
import './CreateChecklist.css'

export class CreateChecklist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      week: 1,
      topicName: '',
      rowName: '',
      openAdd: ''
    }
  }

  componentWillMount() {
    this.props.resetChecklist()
    this.props.getOneCI(this.props.courseId)
  }

  // Make api call to save checklist to database.
  handleSubmit = async e => {
    e.preventDefault()
    if (this.state.week <= 0 || this.state.week > this.props.selectedInstance.weekAmount) {
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
    this.setState({
      week: Number(e.target.value)
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
    this.props.getOneChecklist({
      week: this.state.week,
      courseInstanceId: this.props.selectedInstance.id
    })
  }

  changeTextArea = async e => {
    this.props.changeString(e.target.value)
  }

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

  render() {
    return (
      <div className="CreateChecklist">
        <Header>{this.props.selectedInstance.name}</Header>
        <div className="editForm">
          <Form.Field>
            <Label>Week </Label>
            <Input type="number" name="week" step="1" value={this.state.week} onChange={this.changeWeek} style={{ width: '100px', marginRight: '10px' }} />
            <Button className="loadButton" type="button" onClick={this.loadChecklist}>
              Load checklist
            </Button>
          </Form.Field>
          <div>
            {Object.keys(this.props.checklist.data).map(key => (
              <Card fluid color="red" key={key}>
                <Card.Content>
                  <Header classname="topicHeader">{key}</Header>
                  <Button className="deleteButton" type="button" color="red" onClick={this.removeTopic(key)}>
                    Delete
                  </Button>
                </Card.Content>
                {this.props.checklist.data[key].map(row => (
                  <Card.Content key={row.name}>
                    <Header>{row.name}</Header>
                    <Button className="deleteButton" type="button" onClick={this.removeRow(key, row.name)}>
                      Delete
                    </Button>
                    <Form.Field>
                      <Label>Points</Label>
                      <Input type="number" step="0.25" value={row.points} onChange={this.changeField(key, row.name, 'points')} />
                    </Form.Field>
                    <Form.Field>
                      <Label>Text when checked</Label>
                      <Input type="text" value={row.textWhenOn} onChange={this.changeField(key, row.name, 'textWhenOn')} />
                    </Form.Field>
                    <Form.Field>
                      <Label>Text when unchecked</Label>
                      <Input type="text" value={row.textWhenOff} onChange={this.changeField(key, row.name, 'textWhenOff')} />
                    </Form.Field>
                  </Card.Content>
                ))}
                <form onSubmit={this.newRow(key)}>
                  <Popup trigger={<Button type="submit" circular icon={{ name: 'add', size: 'large' }} />} content="Add new checkbox" />
                  {this.state.openAdd === key ? (
                    <div>
                      <Label>Name</Label>
                      <Input type="text" value={this.state.rowName} onChange={this.changeRowName} />
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
            <form onSubmit={this.newTopic}>
              <Popup trigger={<Button type="submit" circular icon={{ name: 'add', size: 'large' }} />} content="Add new topic" />
              {this.state.openAdd === 'newTopic' ? (
                <div>
                  <Label>Name</Label>
                  <Input type="text" value={this.state.topicName} onChange={this.changeTopicName} />
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
            <Button className="saveButton" type="submit">
              Save
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
  removeRow
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateChecklist)
