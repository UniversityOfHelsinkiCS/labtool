import React from 'react'
import { Form, TextArea, Message, Button, Modal } from 'semantic-ui-react'

export default class JsonImport extends React.Component {
  state = { open: false, data: null, error: null }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  onChange = e => {
    try {
      const parsedJson = JSON.parse(e.target.value)
      this.setState({ data: parsedJson, error: null })
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.setState({ error: `Failed to parse JSON: ${error.message}` })
      }
    }
  }

  render() {
    const { style } = this.props
    const { open } = this.state

    return (
      <React.Fragment>
        <Button disabled={open} onClick={this.open} style={style}>
          Import from JSON
        </Button>

        <Modal onClose={this.close} open={open}>
          <Modal.Header>JSON</Modal.Header>
          <Modal.Description style={{ padding: 15 }}>
            {this.state.error && (
              <Message error>
                <p>{this.state.error}</p>
              </Message>
            )}
            <Form>
              <TextArea rows={40} onChange={this.onChange} />
            </Form>
          </Modal.Description>
          <Modal.Actions>
            <Button content="Close" negative onClick={this.close} />
            <Button
              content="Import"
              positive
              disabled={!!this.state.error}
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
