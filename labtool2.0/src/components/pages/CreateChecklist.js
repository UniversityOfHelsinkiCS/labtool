import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, TextArea, Header, Input, Label, Button, Popup, Card } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist, getOneChecklist } from '../../services/checklist'
import { getOneCI } from '../../services/courseInstance'
import { resetChecklist, changeString, changeField, addTopic, addRow } from '../../reducers/checklistReducer'

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
      const json = JSON.parse(e.target.json.value)
      this.props.createChecklist({
        courseInstanceId: this.props.selectedInstance.id,
        week: this.state.week,
        checklist: json
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
    if (this.state.openAdd !== 'newTopic') {
      this.setState({
        openAdd: 'newTopic'
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
    if (this.state.openAdd !== key) {
      this.setState({
        openAdd: key
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

  render() {
    return (
      <div className="CreateChecklist">
        <Header>{this.props.selectedInstance.name}</Header>
        <Form onSubmit={this.handleSubmit}>
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
                {this.props.checklist.data[key].map(row => (
                  <div key={row.name}>
                    <Form.Field>
                      <Label>Name</Label>
                      <Input type="text" value={row.name} onChange={this.changeField(key, row.name, 'name')} />
                    </Form.Field>
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
                  </div>
                ))}
                <Popup trigger={<Button type="button" onClick={this.newRow(key)} circular icon={{ name: 'add', size: 'large' }} />} content="Add new checkbox" />
                {this.state.openAdd === key ? <Input type="text" onChange={this.changeRowName} /> : <div />}
              </Card>
            ))}
            <Popup trigger={<Button type="button" onClick={this.newTopic} circular icon={{ name: 'add', size: 'large' }} />} content="Add new topic" />
            {this.state.openAdd === 'newTopic' ? <Input type="text" onChange={this.changeTopicName} /> : <div />}
          </div>
          <Form.Field>
            <Label>Checklist as JSON</Label>
            <TextArea className="checklistJSONInput" name="json" rows="20" value={this.props.checklist.string} onChange={this.changeTextArea} />
          </Form.Field>
          <Button className="saveButton" type="submit">Save</Button>
        </Form>
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
  changeString,
  changeField,
  addTopic,
  addRow
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateChecklist)
