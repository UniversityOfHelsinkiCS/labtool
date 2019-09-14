import React from 'react'
import { Form, TextArea, Message, Button, Modal } from 'semantic-ui-react'

export default class JsonEdit extends React.Component {
  state = { open: false, data: null, error: null }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  onChange = e => {
    try {
      if (!e.target.value) {
        this.setState({ error: null })
      }
      const parsedJson = JSON.parse(e.target.value)
      this.setState({ data: parsedJson, error: null })
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.setState({ error: `Failed to parse JSON: ${error.message}` })
      }
    }
  }

  render() {
    const { data, style } = this.props
    const { open } = this.state

    return (
      <React.Fragment>
        <Button disabled={open} onClick={this.open} style={style}>
          Edit as JSON
        </Button>

        <Modal onClose={this.close} open={open}>
          <Modal.Header>JSON</Modal.Header>
          <Modal.Description style={{ padding: 15 }}>Pressing &quot;Save&quot; saves immediately and overwrites the current checklist.</Modal.Description>
          <Modal.Description style={{ padding: 15 }}>
            {this.state.error && (
              <Message error>
                <p>{this.state.error}</p>
              </Message>
            )}
            <Form>
              <TextArea rows={40} onChange={this.onChange} style={{ fontFamily: 'monospace' }} defaultValue={JSON.stringify(data, null, 4)} />
            </Form>
          </Modal.Description>
          <Modal.Actions>
            <Button content="Close" negative onClick={this.close} />
            <Button
              content="Save"
              positive
              disabled={!!this.state.error || !this.state.data}
              onClick={() => {
                this.props.onImport(this.state.data)
                this.close()
              }}
            />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}
