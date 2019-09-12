import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

export default class JsonExport extends React.Component {
  state = { open: false }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  render() {
    const { data, style } = this.props
    const { open } = this.state

    return (
      <React.Fragment>
        <Button disabled={open} onClick={this.open} style={style}>
          Export as JSON
        </Button>

        <Modal onClose={this.close} open={open}>
          <Modal.Header>JSON</Modal.Header>
          <Modal.Description>
            <pre style={{ margin: 15 }}>
              <code>{JSON.stringify(data, null, 4)}</code>
            </pre>
          </Modal.Description>
          <Modal.Actions>
            <Button content="Close" negative onClick={this.close} />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}
