import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon, Comment, Label } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { trimDate } from '../util/format'

export const LabtoolComment = ({ comment, allowNotify, latestComment, sendCommentEmail }) =>
  comment.hidden ? (
    <Comment key={comment.id} disabled>
      <Comment.Content>
        <Comment.Metadata>
          <div>Hidden</div>
        </Comment.Metadata>
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

export default withRouter(
  connect(
    null,
    {}
  )(LabtoolComment)
)
