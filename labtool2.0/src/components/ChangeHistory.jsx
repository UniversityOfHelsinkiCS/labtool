import React from 'react'
import PropTypes from 'prop-types'
import { Header, Icon, Label, List } from 'semantic-ui-react'

const formatTime = iso => new Date(iso).toLocaleString('fi-FI')
const show = value => (value === null || value === undefined || value === '' ? '–' : String(value))

const TextChange = ({ label, change }) => (
  <List.Item>
    {label} changed
    <details style={{ marginTop: '4px' }}>
      <summary style={{ cursor: 'pointer' }}>Show old and new text</summary>
      <div style={{ marginTop: '4px' }}>
        <strong>Before:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '2px 0 8px' }}>{show(change.from)}</pre>
        <strong>After:</strong>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '2px 0' }}>{show(change.to)}</pre>
      </div>
    </details>
  </List.Item>
)

TextChange.propTypes = {
  label: PropTypes.string.isRequired,
  change: PropTypes.object.isRequired
}

const checkState = checked => (checked ? 'checked' : 'unchecked')

const describeChanges = changes => {
  const lines = []
  if (changes.points)
    lines.push(
      <List.Item key="points">
        Points {show(changes.points.from)} → {show(changes.points.to)}
      </List.Item>
    )
  if (changes.grade)
    lines.push(
      <List.Item key="grade">
        Grade {show(changes.grade.from)} → {show(changes.grade.to)}
      </List.Item>
    )
  if (changes.feedback) lines.push(<TextChange key="feedback" label="Feedback" change={changes.feedback} />)
  if (changes.instructorNotes) {
    lines.push(<TextChange key="notes" label="Review notes" change={changes.instructorNotes} />)
  }
  if (changes.checklist) {
    lines.push(
      <List.Item key="checklist">
        Checklist: {changes.checklist.length} {changes.checklist.length === 1 ? 'box' : 'boxes'} changed (
        {changes.checklist
          .map(item => `${item.name} ${checkState(item.from)} → ${checkState(item.to)}`)
          .join(', ')}
        )
      </List.Item>
    )
  }
  if (changes.github) {
    lines.push(
      <List.Item key="github">
        {changes.github.from ? (
          <>
            Repository {changes.github.from} → {show(changes.github.to)}
          </>
        ) : (
          <>Repository set to {show(changes.github.to)}</>
        )}
      </List.Item>
    )
  }
  return lines
}

/**
 * Change history for instructors (#1129, #1132), styled like other instructor-only content.
 */
export const ChangeHistory = ({ title, entries, subjectOf }) => (
  <div
    className="changeHistory"
    style={{
      border: '2px solid #f2711c',
      background: '#fff6ef',
      borderRadius: '4px',
      padding: '10px 12px',
      margin: '1em 0',
      textAlign: 'left'
    }}
  >
    <Header as="h4" style={{ marginTop: 0 }}>
      {title}
    </Header>
    <Label color="orange" size="small" style={{ marginBottom: '10px' }}>
      <Icon name="eye slash" />
      Instructors only: not shown to the student
    </Label>
    {entries.length === 0 ? (
      <p>No changes recorded yet. Changes are recorded since October 2026.</p>
    ) : (
      <List divided relaxed>
        {entries.map(entry => (
          <List.Item key={entry.id} className="changeHistoryEntry">
            <List.Content>
              <List.Header>
                {subjectOf && <span className="changeHistorySubject">{subjectOf(entry)} · </span>}
                {formatTime(entry.createdAt)} · {entry.by || 'Unknown user'}
              </List.Header>
              <List bulleted>{describeChanges(entry.changes)}</List>
            </List.Content>
          </List.Item>
        ))}
      </List>
    )}
  </div>
)

ChangeHistory.propTypes = {
  title: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  // labels each entry, e.g. "Week 3", when the history covers more than one review
  subjectOf: PropTypes.func
}

export default ChangeHistory
