import React from 'react'
import { Button, Header, Segment, Portal } from 'semantic-ui-react'

export default class JsonExport extends React.Component {
  state = { open: false }

  close = () => this.setState({ open: false })
  open = () => this.setState({ open: true })

  render() {
    const { data } = this.props
    const { open } = this.state

    return (
      <React.Fragment>
        <Button disabled={open} positive onClick={this.open}>
          Export as JSON
        </Button>

        <Portal onClose={this.close} open={open}>
          <Segment
            style={{
              left: '40%',
              top: '30%',
              width: '20%',
              position: 'fixed',
              zIndex: 100
            }}
          >
            <Header>JSON</Header>
            <pre>
              <code>{JSON.stringify(data, null, 4)}</code>
            </pre>
            <Button content="Close" negative onClick={this.close} />
          </Segment>
        </Portal>
      </React.Fragment>
    )
  }
}
