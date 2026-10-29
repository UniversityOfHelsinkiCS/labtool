import React from 'react'
import PropTypes from 'prop-types'
import { Header, Icon, Label, List } from 'semantic-ui-react'
import { roundPoints } from '../util/format'

const formatTime = iso => new Date(iso).toLocaleString('fi-FI')
const show = value => (value === null || value === undefined || value === '' ? '–' : String(value))
// points are floating point numbers; show them rounded (#508)
const showPoints = value => (typeof value === 'number' ? roundPoints(value) : show(value))
const checkState = checked => (checked ? 'checked' : 'unchecked')

// the first version of a review, grading or repository (not a change from an earlier one)
const initialLabel = kind =>
  ({
    week_review: 'Initial review',
    week_draft: 'Initial draft',
    code_review_grade: 'Initial grading',
    repository: 'Repository at registration'
  })[kind] || 'Initial version'

const TextChange = ({ label, change, initial }) =>
  initial ? (
    <List.Item>
      {label}
      <details style={{ marginTop: '4px' }}>
        <summary style={{ cursor: 'pointer' }}>Show text</summary>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{show(change.to)}</pre>
      </details>
    </List.Item>
  ) : (
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
  change: PropTypes.object.isRequired,
  initial: PropTypes.bool
}

// initial entries list the values; later entries list old → new
const describeChanges = (changes, initial) => {
  const lines = []
  const value = (label, change, format = show) =>
    initial ? `${label} ${format(change.to)}` : `${label} ${format(change.from)} → ${format(change.to)}`
  if (changes.points) {
    lines.push(<List.Item key="points">{value('Points', changes.points, showPoints)}</List.Item>)
  }
  if (changes.grade) lines.push(<List.Item key="grade">{value('Grade', changes.grade)}</List.Item>)
  if (changes.feedback) {
    lines.push(<TextChange key="feedback" label="Feedback" change={changes.feedback} initial={initial} />)
  }
  if (changes.instructorNotes) {
    lines.push(
      <TextChange key="notes" label="Review notes" change={changes.instructorNotes} initial={initial} />
    )
  }
  if (changes.checklist) {
    lines.push(
      <List.Item key="checklist">
        {initial
          ? `Checklist: ${changes.checklist.map(item => `${item.name} ${checkState(item.to)}`).join(', ')}`
          : `Checklist: ${changes.checklist.length} ${changes.checklist.length === 1 ? 'box' : 'boxes'} changed (${changes.checklist
              .map(item => `${item.name} ${checkState(item.from)} → ${checkState(item.to)}`)
              .join(', ')})`}
      </List.Item>
    )
  }
  if (changes.github) {
    lines.push(
      <List.Item key="github">
        {initial
          ? show(changes.github.to)
          : changes.github.from
            ? `Repository ${changes.github.from} → ${show(changes.github.to)}`
            : `Repository set to ${show(changes.github.to)}`}
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
                {entry.kind === 'week_draft' && (
                  <Label size="mini" basic className="draftEntry" style={{ marginLeft: '6px' }}>
                    Draft
                  </Label>
                )}
                {entry.initial && (
                  <Label
                    size="mini"
                    basic
                    color="orange"
                    className="initialEntry"
                    style={{ marginLeft: '6px' }}
                  >
                    {initialLabel(entry.kind)}
                  </Label>
                )}
              </List.Header>
              <List bulleted>{describeChanges(entry.changes, entry.initial)}</List>
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
