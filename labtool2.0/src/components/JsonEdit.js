import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, TextArea, Message, Button, Modal } from 'semantic-ui-react'
import useLegacyState from '../hooks/legacyState'

import FileInput from './FileInput'

const JsonEdit = props => {
  const state = useLegacyState({ open: false, data: null, error: null })

  const closeDialog = () => (state.open = false)
  const openDialog = () => (state.open = true)

  const setData = json => {
    try {
      if (!json) {
        state.error = null
      }
      JSON.parse(json)
      state.data = json
      state.error = null
    } catch (error) {
      if (error instanceof SyntaxError) {
        state.data = json
        state.error = `Failed to parse JSON: ${error.message}`
      }
    }
  }

  const removeIdsFromJson = () => {
    try {
      const obj = JSON.parse(state.data)
      for (const category of Object.keys(obj)) {
        const items = obj[category]
        if (Array.isArray(items)) {
          for (const item of items) {
            delete item['id']
          }
        }
      }
      setData(JSON.stringify(obj, null, 4))
    } catch (error) {
      console.error(error)
      if (error instanceof SyntaxError) {
        state.error = `Failed to parse JSON: ${error.message}`
      }
    }
  }

  const onChange = e => setData(e.target.value)
  const hasValidData = () => !!state.data && !state.error

  useEffect(() => {
    setData(JSON.stringify(props.initialData, null, 4))
  }, [props.initialData])

  const { downloadName, style } = props
  const { data, open } = state

  return (
    <React.Fragment>
      <Button disabled={open} onClick={openDialog} style={style}>
        Edit as JSON
      </Button>

      <Modal onClose={closeDialog} open={open}>
        <Modal.Header>JSON</Modal.Header>
        <Modal.Description style={{ padding: 15 }}>
          Pressing &quot;Save&quot; saves immediately and overwrites the current checklist. When copying checklists or adding new items, make sure to remove the IDs (such as by clicking the button
          below).
        </Modal.Description>
        <Modal.Description>
          {state.error && (
            <Message style={{ padding: 15 }} error>
              <p>{state.error}</p>
            </Message>
          )}
          <Form>
            <TextArea rows={40} onChange={onChange} style={{ padding: 15, fontFamily: 'monospace' }} value={data} />
          </Form>
        </Modal.Description>
        <Modal.Actions>
          <Button
            disabled={!hasValidData()}
            content="Download"
            floated="left"
            as="a"
            href={hasValidData() ? `data:application/json,${encodeURI(JSON.stringify(JSON.parse(data), null, 4))}` : undefined}
            download={downloadName || 'data.json'}
            target="_blank"
          />
          <FileInput
            onFileUploaded={data => {
              try {
                state.data = JSON.stringify(JSON.parse(new TextDecoder().decode(data)), null, 4)
              } catch (e) {
                state.error = `File had invalid data: ${e.message}`
              }
            }}
            floated="left"
            allowedFileTypes={['application/json']}
          />
          <Button content="Remove all IDs" onClick={removeIdsFromJson} />
          <Button content="Close" negative onClick={closeDialog} />
          <Button
            content="Save"
            positive
            disabled={!hasValidData()}
            onClick={() => {
              props.onImport(JSON.parse(state.data))
              closeDialog()
            }}
          />
        </Modal.Actions>
        <br />
        <br />
        <br />
      </Modal>
    </React.Fragment>
  )
}
export default JsonEdit

JsonEdit.propTypes = {
  onImport: PropTypes.func.isRequired,
  initialData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  style: PropTypes.object,
  downloadName: PropTypes.string
}
