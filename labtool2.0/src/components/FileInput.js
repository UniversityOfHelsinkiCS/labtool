import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Form, Progress, Message } from 'semantic-ui-react'

export default class FileInput extends React.Component {
  state = { open: false, uploading: false, uploadProgress: null, uploadError: null }

  constructor(props) {
    super(props)

    this.fileReader = new FileReader()
    this.fileReader.onloadstart = () => this.setState({ uploading: true, uploadProgress: 0 })
    this.fileReader.onprogress = progress => {
      if (progress.lengthComputable) {
        this.setState({ uploadProgress: 100 * (progress.loaded / progress.total) })
      }
    }
    this.fileReader.onerror = () => this.setState({ uploadError: this.fileReader.error.message, uploadProgress: null })
    this.fileReader.onload = () => {
      this.props.onFileUploaded(this.fileReader.result)
      this.close()
    }
  }

  open = () => this.setState({ open: true })
  close = () => {
    this.fileReader.abort()
    this.setState({ open: false, uploading: false, uploadProgress: null, uploadError: null })
  }

  handleFile = event => {
    if (event.target.files && event.target.files[0]) {
      this.fileReader.readAsArrayBuffer(event.target.files[0])
    }
  }

  render() {
    const { allowedFileTypes, style, ...props } = this.props
    const { open, uploading, uploadProgress, uploadError } = this.state

    return (
      <React.Fragment>
        <Button disabled={open} onClick={this.open} style={style} {...props}>
          Upload
        </Button>

        <Modal onClose={this.close} open={open}>
          <Modal.Header>Select file</Modal.Header>
          <Modal.Description style={{ padding: 15 }}>
            {!uploading && (
              <Form>
                <Form.Input type="file" name="file" accept={allowedFileTypes && allowedFileTypes.join()} onChange={this.handleFile} onClick={e => (e.target.value = null)} />
              </Form>
            )}
            {uploading && uploadProgress !== null && <Progress percent={uploadProgress} indicating />}
            {uploading &&
              uploadError && (
                <Message error>
                  <p>{this.state.uploadError}</p>
                </Message>
              )}
          </Modal.Description>
          <Modal.Actions>
            <Button content="Close" negative onClick={this.close} />
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    )
  }
}

FileInput.propTypes = {
  onFileUploaded: PropTypes.func.isRequired,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
}
