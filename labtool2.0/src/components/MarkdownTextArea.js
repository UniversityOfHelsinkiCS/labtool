import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Form, Icon } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'

// replace Form.TextArea with FormMarkdownTextArea
// only adds preview and info line, Markdown needs to be supported by code
// viewing the text outside the text area
export class FormMarkdownTextArea extends React.Component {
  state = { activeIndex: -1, textValue: this.props.defaultValue ? this.props.defaultValue : '' }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ ...this.state, activeIndex: newIndex })
  }

  handleChange = (e, data) => {
    this.setState({ ...this.state, textValue: data.value })
  }

  render() {
    const { activeIndex, textValue } = this.state

    return (
      <div>
        <Form.TextArea onInput={this.handleChange.bind(this)} {...this.props} />
        <p>
          <i>
            This field supports{' '}
            <a href="https://guides.github.com/features/mastering-markdown/" target="_blank" rel="noopener noreferrer">
              Markdown
            </a>.
          </i>
        </p>
        <Accordion key fluid styled style={{ textAlign: 'start' }}>
          <Accordion.Title active={0 === activeIndex} index={0} onClick={this.handleClick.bind(this)}>
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
}

FormMarkdownTextArea.propTypes = {
  defaultValue: PropTypes.string
}
