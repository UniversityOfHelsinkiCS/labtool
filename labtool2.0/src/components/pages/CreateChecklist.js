import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, TextArea, Header, Input } from 'semantic-ui-react'
import { showNotification } from '../../reducers/notificationReducer'
import { createChecklist } from '../../services/checklist'

export class CreateChecklist extends Component {
  handleSubmit = async e => {
    e.preventDefault()
    try {
      const json = JSON.parse(e.target.json.value)
      this.props.createChecklist({
        week: 1,
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
          <TextArea name="json" rows="20" />
          <Input type="submit" value="Create new checklist" />
        </Form>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = {
  showNotification,
  createChecklist
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateChecklist)
