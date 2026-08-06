import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, Form, Progress, Message } from 'semantic-ui-react'
import useLegacyState from '../hooks/legacyState'

export const FileInput = props => {
  const state = useLegacyState({ open: false, uploading: false, uploadProgress: null, uploadError: null })

  const openDialog = () => {
    state.open = true
  }
  const closeDialog = () => {
    fileReader.abort()
    state.open = false
    state.uploading = false
    state.uploadProgress = null
    state.uploadError = null
  }

  const fileReader = new FileReader()
  fileReader.onloadstart = () => {
    state.uploading = true
    state.uploadProgress = 0
  }
  fileReader.onprogress = progress => {
    if (progress.lengthComputable) {
      state.uploadProgress = 100 * (progress.loaded / progress.total)
    }
  }
  fileReader.onerror = () => {
    state.uploadError = fileReader.error.message
    state.uploadProgress = null
  }
  fileReader.onload = () => {
    props.onFileUploaded(fileReader.result)
    closeDialog()
  }

  const handleFile = event => {
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsArrayBuffer(event.target.files[0])
    }
  }

  const { allowedFileTypes, style } = props
  const { open, uploading, uploadProgress, uploadError } = state
  const cleanedProps = { ...props, onFileUploaded: null, allowedFileTypes: null }

  return (
    <React.Fragment>
      <Button disabled={open} onClick={openDialog} style={style} {...cleanedProps}>
        Upload
      </Button>

      <Modal onClose={closeDialog} open={open}>
        <Modal.Header>Select file</Modal.Header>
        <Modal.Description style={{ padding: 15 }}>
          {!uploading && (
            <Form>
              <Form.Input type="file" name="file" accept={allowedFileTypes && allowedFileTypes.join()} onChange={handleFile} onClick={e => (e.target.value = null)} />
            </Form>
          )}
          {uploading && uploadProgress !== null && <Progress percent={uploadProgress} indicating />}
          {uploading && uploadError && (
            <Message error>
              <p>{uploadError}</p>
            </Message>
          )}
        </Modal.Description>
        <Modal.Actions>
          <Button content="Close" negative onClick={closeDialog} />
        </Modal.Actions>
      </Modal>
    </React.Fragment>
  )
}
export default FileInput

FileInput.propTypes = {
  onFileUploaded: PropTypes.func.isRequired,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
}
