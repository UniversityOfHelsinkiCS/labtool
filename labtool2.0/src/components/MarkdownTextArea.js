import React from 'react'
import useLegacyState from '../hooks/legacyState'
import PropTypes from 'prop-types'
import { Accordion, Form, Icon } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

// replace Form.TextArea with FormMarkdownTextArea
// only adds preview and info line, Markdown needs to be supported by code
// viewing the text outside the text area
export const FormMarkdownTextArea = props => {
  const { defaultValue } = props
  const state = useLegacyState({ activeIndex: -1, textValue: defaultValue ? defaultValue : '' })

  const handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    state.activeIndex = newIndex
  }

  const handleChange = (e, data) => {
    state.textValue = data.value
  }

  const { activeIndex, textValue } = state

  return (
    <div>
      <Form.TextArea onInput={handleChange} {...props} />
      <p>
        <i>
          This field supports{' '}
          <a href="https://guides.github.com/features/mastering-markdown/" target="_blank" rel="noopener noreferrer">
            Markdown
          </a>.
        </i>
      </p>
      <Accordion key fluid styled style={{ textAlign: 'start' }}>
        <Accordion.Title active={0 === activeIndex} index={0} onClick={handleClick}>
          <Icon name="dropdown" />
          Preview Markdown
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 0}>
          <ReactMarkdown source={textValue} />
        </Accordion.Content>
      </Accordion>
    </div>
  )
}

FormMarkdownTextArea.propTypes = {
  defaultValue: PropTypes.string
}
