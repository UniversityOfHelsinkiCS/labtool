import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, TextArea, Header, Input, Label, Message } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist } from '../../services/checklist'
import { getOneCI } from '../../services/courseInstance'

export class CreateChecklist extends Component {
  componentWillMount() {
    this.props.getOneCI(this.props.courseId)
  }

  handleSubmit = async e => {
    e.preventDefault()
    if (e.target.week.value <= 0 || e.target.week.value > this.props.selectedInstance.weekAmount) {
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
        week: e.target.week.value,
        checklist: json
      })
    } catch (e) {
      this.props.showNotification({
        message: 'Could not parse JSON.',
        error: true
      })
    }
  }

  render() {
    return (
      <div className="CreateChecklist">
        <Header>Create new checklist</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <Label>Week </Label>
            <Input type="number" name="week" step="1" style={{ width: '50px' }} />
          </Form.Field>
          <Form.Field>
            <Label>Checklist as JSON</Label>
            <TextArea name="json" rows="20" />
          </Form.Field>
          <Input type="submit" value="Create new checklist" />
        </Form>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    selectedInstance: state.selectedInstance
  }
}

const mapDispatchToProps = {
  showNotification,
  createChecklist,
  getOneCI
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateChecklist)
