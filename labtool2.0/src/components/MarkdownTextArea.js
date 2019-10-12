import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Form, Icon, TextArea } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

import useLegacyState from '../hooks/legacyState'

// replace Form.TextArea with FormMarkdownTextArea
// only adds preview and info line, Markdown needs to be supported by code
// viewing the text outside the text area
export const FormMarkdownTextArea = props => {
  const { defaultValue } = props
  const state = useLegacyState({ previewOpen: false, textValue: defaultValue ? defaultValue : '', width: window.innerWidth })

  const handleClick = e => {
    state.previewOpen = !state.previewOpen
  }

  const handleChange = (e, data) => {
    state.textValue = data.value
  }

  const handlePreviewChange = () => {
    state.textValue = props.value
  }

  const isWide = () => state.width >= 800

  const changeDirection = () => (isWide() ? 'row' : 'column')
  const getMargin = () => (isWide() ? '0.5em' : 0)
  const getPreviewHeight = () => (isWide() ? '80px' : '200px')

  const onResize = () => {
    state.width = window.innerWidth
  }

  useEffect(() => {
    window.addEventListener('resize', onResize)
    document.documentElement.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      document.documentElement.removeEventListener('resize', onResize)
    }
  })

  const { previewOpen, textValue } = state

  return (
    <div>
      <p>
        <i>
          This field supports{' '}
          <a href="https://guides.github.com/features/mastering-markdown/" target="_blank" rel="noopener noreferrer">
            Markdown
          </a>
          .
        </i>
      </p>
      <div style={{ display: 'flex', flexDirection: changeDirection() }}>
        <Form.Field style={{ flex: '50%', marginRight: getMargin() }}>
          <TextArea onInput={handleChange} {...props} style={{ height: '120px', marginBottom: '15px' }} />
        </Form.Field>
        <Accordion key fluid styled style={{ flex: '50%', textAlign: 'start', marginBottom: '2em', overflowY: 'auto', marginTop: 0, marginLeft: getMargin() }}>
          <Accordion.Title
            active={isWide() || previewOpen}
            onClick={() => {
              handleClick()
              handlePreviewChange()
            }}
          >
            <Icon name="dropdown" />
            Preview Markdown
          </Accordion.Title>
          <Accordion.Content active={isWide() || previewOpen} style={{ height: getPreviewHeight() }}>
            <ReactMarkdown source={textValue} />
          </Accordion.Content>
        </Accordion>
      </div>
    </div>
  )
}

FormMarkdownTextArea.propTypes = {
  value: PropTypes.any,
  defaultValue: PropTypes.string
}
