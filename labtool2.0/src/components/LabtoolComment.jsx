import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Comment, Label } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { trimDate } from '../util/format'

export const LabtoolComment = ({ comment, allowNotify, latestComment, sendCommentEmail }) =>
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
        <Comment.Author>{comment.from}</Comment.Author>
        <Comment.Text>
          {' '}
          <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
        </Comment.Text>
        <Comment.Metadata>
          <div>{trimDate(comment.createdAt)}</div>
        </Comment.Metadata>
        <div> </div>
      </Comment.Content>
    </Comment>
  ) : (
    <Comment key={comment.id}>
      <Comment.Author>{comment.from}</Comment.Author>
      <Comment.Text>
        {' '}
        <ReactMarkdown>{comment.comment}</ReactMarkdown>{' '}
      </Comment.Text>
      <Comment.Metadata>
        <div>{trimDate(comment.createdAt)}</div>
      </Comment.Metadata>
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
  sendCommentEmail: PropTypes.func
}

export default withRouter(connect(null, {})(LabtoolComment))
