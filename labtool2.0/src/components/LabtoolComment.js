import React from 'react'
import { Button, Icon, Comment, Label } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { trimDate } from '../util/format'

export class LabtoolComment extends React.Component {
  render() {
    const { comment, allowNotify } = this.props

    return comment.hidden ? (
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
        {allowNotify ? (
          comment.notified ? (
            <Label>
              Notified <Icon name="check" color="green" />
            </Label>
          ) : (
            <Button type="button" onClick={this.props.sendCommentEmail(comment.id)} size="small">
              Send email notification
            </Button>
          )
        ) : (
          <div />
        )}
      </Comment>
    )
  }
}

export default withRouter(
  connect(
    null,
    {}
  )(LabtoolComment)
)
