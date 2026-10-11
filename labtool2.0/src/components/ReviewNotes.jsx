import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Comment, Form } from 'semantic-ui-react'
import ReactMarkdown from 'react-markdown'
import { trimDate } from '../util/format'

/**
 * Additional review notes on a final review. Only the assigned instructor edits the review notes of the
 * final review; the rest of the course staff add notes of their own here. Never shown to students.
 */
export const ReviewNotes = ({ notes, onAdd }) => {
  const [text, setText] = useState('')

  const add = () => {
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }

  return (
    <div className="reviewNotes">
      {notes.length > 0 && (
        <Comment.Group minimal style={{ maxWidth: 'none' }}>
          {notes.map(note => (
            <Comment key={note.id} className="reviewNote">
              <Comment.Content>
                <Comment.Author as="span">{note.by || 'Unknown user'}</Comment.Author>
                <Comment.Metadata>
                  <div>{trimDate(note.createdAt)}</div>
                </Comment.Metadata>
                <Comment.Text>
                  <ReactMarkdown>{note.text}</ReactMarkdown>
                </Comment.Text>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      )}
      {onAdd && (
        <div className="addReviewNote">
          <Form.TextArea
            name="reviewNote"
            placeholder="Add a review note for the other instructors"
            value={text}
            onChange={(e, { value }) => setText(value)}
            style={{ minHeight: '70px' }}
          />
          <Button
            type="button"
            size="small"
            color="orange"
            className="addReviewNoteButton"
            disabled={!text.trim()}
            onClick={add}
          >
            Add note
          </Button>
        </div>
      )}
    </div>
  )
}

ReviewNotes.propTypes = {
  notes: PropTypes.array.isRequired,
  // adds a note with the given text; without it the notes are only listed
  onAdd: PropTypes.func
}

export default ReviewNotes
