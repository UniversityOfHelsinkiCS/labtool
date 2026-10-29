import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Form, Icon, Label } from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { FormMarkdownTextArea } from './MarkdownTextArea'
import { usePersistedState } from '../hooks/persistedState'

const NO_COMMENTS = []

export const LabtoolAddComment = ({
  commentFieldId,
  weekId,
  handleSubmit,
  allowHidden,
  comments = NO_COMMENTS
}) => {
  // hidden: the comment is for instructors only; new comments are visible to the student by default (#1142)
  const state = usePersistedState(`LabtoolAddComment_${commentFieldId}`, {
    commentOpen: false,
    comment: '',
    hidden: false,
    // a comment that has been sent but is not among the comments yet, { comment, hidden } (#1145)
    sent: null
  })
  const instructorsOnly = allowHidden && state.hidden
  const mounted = useRef(false)

  // A sent comment is kept in this browser until it shows up among the comments. If the login had expired,
  // the page is reloaded and the comment did not get saved: it is put back into the form (#1145).
  useEffect(() => {
    const { sent } = state
    if (sent) {
      const saved = comments.some(c => (c.comment || '').trim() === sent.comment.trim())
      if (saved) {
        state.sent = null
      } else if (!mounted.current && !state.comment) {
        state.comment = sent.comment
        state.hidden = sent.hidden
        state.commentOpen = true
      }
    }
    mounted.current = true
  }, [comments])

  const toggleOpen = () => {
    state.commentOpen = !state.commentOpen
  }

  const doSubmit = (...args) => {
    state.sent = state.comment.trim() ? { comment: state.comment, hidden: !!state.hidden } : null
    state.comment = ''
    state.hidden = false
    state.commentOpen = false
    handleSubmit(...args)
  }

  return (
    <Accordion fluid styled style={{ textAlign: 'start', overflow: 'auto' }}>
      <Accordion.Title active={state.commentOpen} onClick={toggleOpen}>
        <Icon name="dropdown" />
        Add comment
      </Accordion.Title>
      <Accordion.Content active={state.commentOpen}>
        <Form reply onSubmit={doSubmit} name={weekId} id={weekId}>
          {allowHidden && (
            <div className="commentVisibility" style={{ marginBottom: '10px' }}>
              <Label basic>Who can see this comment</Label>{' '}
              <Button.Group size="small">
                <Button type="button" active={!state.hidden} onClick={() => (state.hidden = false)}>
                  <Icon name="eye" />
                  Student and instructors
                </Button>
                <Button
                  type="button"
                  active={state.hidden}
                  color={state.hidden ? 'orange' : undefined}
                  onClick={() => (state.hidden = true)}
                >
                  <Icon name="eye slash" />
                  Instructors only
                </Button>
              </Button.Group>
              {/* read by the form's submit handler (e.target.elements.hidden.checked) */}
              <input
                type="checkbox"
                name="hidden"
                checked={!!state.hidden}
                readOnly
                style={{ display: 'none' }}
              />
            </div>
          )}
          <div
            className={instructorsOnly ? 'instructorOnlyDraft' : undefined}
            style={
              instructorsOnly
                ? { border: '2px solid #f2711c', borderRadius: '4px', padding: '6px' }
                : undefined
            }
          >
            <FormMarkdownTextArea
              name="content"
              placeholder={
                instructorsOnly ? 'Note for instructors, not shown to the student...' : 'Your comment...'
              }
              value={state.comment}
              onChange={(e, { value }) => (state.comment = value)}
              scalable={true}
            />
          </div>
          <br />
          <div style={{ display: 'flex', direction: 'row', alignItems: 'baseline', clear: 'both' }}>
            <Button
              content={instructorsOnly ? 'Add instructor-only note' : 'Add Reply'}
              labelPosition="left"
              icon={instructorsOnly ? 'eye slash' : 'edit'}
              color={instructorsOnly ? 'orange' : undefined}
              primary={!instructorsOnly}
            />
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
  allowHidden: PropTypes.bool,
  // the comments of the week, to tell when a sent comment has been saved
  comments: PropTypes.array
}

export default withRouter(connect(null, {})(LabtoolAddComment))
