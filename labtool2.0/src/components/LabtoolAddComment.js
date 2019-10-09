import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Form, Icon } from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { FormMarkdownTextArea } from './MarkdownTextArea'
import { usePersistedState } from '../hooks/persistedState'

export const LabtoolAddComment = ({ weekId, handleSubmit, allowHidden }) => {
  const state = usePersistedState(`LabtoolAddComment_${weekId}`, { commentOpen: false, comment: '' })

  const toggleOpen = () => {
    state.commentOpen = !state.commentOpen
    if (!state.commentOpen) {
      state.clear()
    }
  }

  const doSubmit = (...args) => {
    state.clear()
    handleSubmit(...args)
  }

  return (
    <Accordion key fluid styled style={{ textAlign: 'start' }}>
      <Accordion.Title active={state.commentOpen} onClick={toggleOpen}>
        <Icon name="dropdown" />
        Add comment
      </Accordion.Title>
      <Accordion.Content active={state.commentOpen}>
        <Form reply onSubmit={doSubmit} name={weekId} id={weekId}>
          <FormMarkdownTextArea name="content" placeholder="Your comment..." value={state.comment} onChange={(e, { value }) => (state.comment = value)} />
          <br></br>
          {allowHidden && (
            <div style={{ display: 'inline-block', marginRight: '10px' }}>
              <Form.Checkbox label="Add comment for instructors only" name="hidden" />
            </div>
          )}
          <Button content="Add Reply" labelPosition="left" icon="edit" primary />
        </Form>
      </Accordion.Content>
    </Accordion>
  )
}

LabtoolAddComment.propTypes = {
  weekId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleSubmit: PropTypes.func.isRequired,
  allowHidden: PropTypes.bool
}

export default withRouter(
  connect(
    null,
    {}
  )(LabtoolAddComment)
)
