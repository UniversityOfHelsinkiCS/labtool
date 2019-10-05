import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Form, Icon } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

import useLegacyState from '../hooks/legacyState'

// replace Form.TextArea with FormMarkdownTextArea
// only adds preview and info line, Markdown needs to be supported by code
// viewing the text outside the text area
export const FormMarkdownTextArea = props => {
  const { defaultValue } = props
  const state = useLegacyState({ previewOpen: false, textValue: defaultValue ? defaultValue : '' })

  const handleClick = e => {
    state.previewOpen = !state.previewOpen
  }

  const handleChange = (e, data) => {
    state.textValue = data.value
  }

  const { previewOpen, textValue } = state

  return (
    <div>
      <Form.TextArea onInput={handleChange} {...props} />
      <p>
        <i>
          This field supports{' '}
          <a href="https://guides.github.com/features/mastering-markdown/" target="_blank" rel="noopener noreferrer">
            Markdown
          </a>
          .
        </i>
      </p>
      <Accordion key fluid styled style={{ textAlign: 'start' }}>
        <Accordion.Title active={previewOpen} onClick={handleClick}>
          <Icon name="dropdown" />
          Preview Markdown
        </Accordion.Title>
        <Accordion.Content active={previewOpen}>
          <ReactMarkdown source={textValue} />
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

FormMarkdownTextArea.propTypes = {
  value: PropTypes.any,
  defaultValue: PropTypes.string
}
