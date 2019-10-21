import React from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Form, Icon } from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { FormMarkdownTextArea } from './MarkdownTextArea'
import { usePersistedState } from '../hooks/persistedState'

export const LabtoolAddComment = ({ commentFieldId, weekId, handleSubmit, allowHidden }) => {
  const state = usePersistedState(`LabtoolAddComment_${commentFieldId}`, { commentOpen: false, comment: '' })

  const toggleOpen = () => {
    state.commentOpen = !state.commentOpen
    if (!state.commentOpen) {
      state.reset()
    }
  }

  const doSubmit = (...args) => {
    state.reset()
    handleSubmit(...args)
  }

  return (
    <Accordion key fluid styled style={{ textAlign: 'start', overflow: 'auto' }}>
      <Accordion.Title active={state.commentOpen} onClick={toggleOpen}>
        <Icon name="dropdown" />
        Add comment
      </Accordion.Title>
      <Accordion.Content active={state.commentOpen}>
        <Form reply onSubmit={doSubmit} name={weekId} id={weekId}>
          <FormMarkdownTextArea name="content" placeholder="Your comment..." value={state.comment} onChange={(e, { value }) => (state.comment = value)} scalable={true} />
          <br />
          <div style={{ display: 'flex', direction: 'row', alignItems: 'baseline', clear: 'both' }}>
            {allowHidden && (
              <div style={{ marginRight: '10px' }}>
                <Form.Checkbox label="Add comment for instructors only" name="hidden" />
              </div>
            )}
            <Button content="Add Reply" labelPosition="left" icon="edit" primary />
          </div>
        </Form>
      </Accordion.Content>
    </Accordion>
  )
}

LabtoolAddComment.propTypes = {
  commentFieldId: PropTypes.string.isRequired,
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
