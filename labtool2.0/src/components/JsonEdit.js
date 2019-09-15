import React from 'react'
import PropTypes from 'prop-types'
import { Form, TextArea, Message, Button, Modal } from 'semantic-ui-react'

import FileInput from './FileInput'

export default class JsonEdit extends React.Component {
  state = { open: false, data: null, error: null }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  setData = json => {
    try {
      if (!json) {
        this.setState({ error: null })
      }
      this.setState({ data: json })
      JSON.parse(json)
      this.setState({ error: null })
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.setState({ error: `Failed to parse JSON: ${error.message}` })
      }
    }
  }

  onChange = e => this.setData(e.target.value)

  hasValidData = () => !!this.state.data && !this.state.error

  render() {
    const { initialData, style } = this.props
    const { data, open } = this.state

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
              <TextArea rows={40} onChange={this.onChange} style={{ fontFamily: 'monospace' }} value={data} defaultValue={JSON.stringify(initialData, null, 4)} />
            </Form>
          </Modal.Description>
          <Modal.Actions>
            <Button
              disabled={!this.hasValidData()}
              content="Download"
              floated="left"
              as="a"
              href={this.hasValidData() ? `data:application/json,${encodeURI(JSON.stringify(JSON.parse(data), null, 4))}` : undefined}
              download="data.json"
              target="_blank"
            />
            <FileInput
              onFileUploaded={data => {
                try {
                  this.setData(JSON.stringify(JSON.parse(new TextDecoder().decode(data)), null, 4))
                } catch (e) {
                  this.setState({ error: `File had invalid data: ${e.message}` })
                }
              }}
              floated="left"
              allowedFileTypes={['application/json']}
            />
            <Button content="Close" negative onClick={this.close} />
            <Button
              content="Save"
              positive
              disabled={!this.hasValidData()}
              onClick={() => {
                this.props.onImport(JSON.parse(this.state.data))
                this.close()
              }}
            />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

JsonEdit.propTypes = {
  onImport: PropTypes.func.isRequired,
  initialData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  style: PropTypes.object
}
