import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Comment, Label, Form } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { trimDate } from '../util/format'

/**
 * The text of a comment, or an editor for it when its author is editing it (#534).
 */
const CommentBody = ({ comment, canEdit, onEdit }) => {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.comment)

  const save = () => {
    if (text.trim().length === 0) return
    onEdit(text)
    setEditing(false)
  }

  return (
    <>
      <Comment.Author>{comment.from}</Comment.Author>
      {editing ? (
        <Form className="editComment" style={{ margin: '6px 0' }}>
          <Form.TextArea
            name="editedComment"
            value={text}
            onChange={(e, { value }) => setText(value)}
            style={{ minHeight: '80px' }}
          />
          <Button type="button" size="small" primary onClick={save} disabled={text.trim().length === 0}>
            Save
          </Button>
          <Button
            type="button"
            size="small"
            onClick={() => {
              setText(comment.comment)
              setEditing(false)
            }}
          >
            Cancel
          </Button>
        </Form>
      ) : (
        <Comment.Text>
          {' '}
          <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
        </Comment.Text>
      )}
      <Comment.Metadata>
        <div>{trimDate(comment.createdAt)}</div>
        {comment.editedAt && <div className="commentEdited">(edited {trimDate(comment.editedAt)})</div>}
      </Comment.Metadata>
      {canEdit && !editing && (
        <Comment.Actions>
          <Comment.Action
            className="editCommentAction"
            onClick={() => {
              setText(comment.comment)
              setEditing(true)
            }}
          >
            <Icon name="edit" />
            Edit
          </Comment.Action>
        </Comment.Actions>
      )}
    </>
  )
}

CommentBody.propTypes = {
  comment: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  onEdit: PropTypes.func
}

export const LabtoolComment = ({ comment, allowNotify, latestComment, sendCommentEmail, canEdit, onEdit }) =>
  comment.hidden ? (
    // instructor-only comments must be unmistakable (#1142)
    <Comment
      key={comment.id}
      className="instructorOnlyComment"
      style={{
        borderLeft: '4px solid #f2711c',
        background: '#fff6ef',
        borderRadius: '4px',
        padding: '8px 10px',
        margin: '6px 0'
      }}
    >
      <Comment.Content>
        <Label color="orange" size="small" style={{ marginBottom: '6px' }}>
          <Icon name="eye slash" />
          Instructors only: not shown to the student
        </Label>
        <CommentBody comment={comment} canEdit={canEdit} onEdit={onEdit} />
        <div> </div>
      </Comment.Content>
    </Comment>
  ) : (
    <Comment key={comment.id}>
      <CommentBody comment={comment} canEdit={canEdit} onEdit={onEdit} />
      <div> </div>
      {allowNotify ? (
        comment.notified ? (
          <Label>
            Notified <Icon name="check" color="green" />
          </Label>
        ) : latestComment ? (
          <Button type="button" onClick={sendCommentEmail} size="small">
            Send email notification
          </Button>
        ) : (
          <div />
        )
      ) : (
        <div />
      )}
    </Comment>
  )

LabtoolComment.propTypes = {
  comment: PropTypes.object.isRequired,
  allowNotify: PropTypes.bool,
  latestComment: PropTypes.bool,
  sendCommentEmail: PropTypes.func,
  // the current user wrote this comment and may edit it (#534)
  canEdit: PropTypes.bool,
  onEdit: PropTypes.func
}

export default withRouter(connect(null, {})(LabtoolComment))
