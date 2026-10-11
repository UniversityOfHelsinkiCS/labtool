import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Grid, Modal } from 'semantic-ui-react'
import { ReviewStudentChecklist } from './pages/ReviewStudent/Checklist'
import { roundPoints } from '../util/format'

const rowIdOf = row => row.id || row.tempId

/**
 * The checklist being edited, in the shape the grading page uses: each row gets its id (or temporary id)
 * and its place, and prerequisites that point outside the checklist are dropped.
 */
export const toGradingChecklist = data => {
  const ids = new Set(
    Object.values(data || {})
      .flat()
      .map(rowIdOf)
  )
  let order = 0
  const list = Object.fromEntries(
    Object.entries(data || {}).map(([topic, rows]) => [
      topic,
      rows.map(row => ({
        ...row,
        id: rowIdOf(row),
        order: order++,
        checkedPoints: Number(row.checkedPoints) || 0,
        uncheckedPoints: Number(row.uncheckedPoints) || 0,
        prerequisite: ids.has(row.prerequisite) ? row.prerequisite : null
      }))
    ])
  )
  return { list }
}

/**
 * Feedback text and points of a checklist with the given checks, computed like on the grading page:
 * texts of checks whose prerequisite is unchecked are left out, minimum requirements give no points,
 * and the points stay between 0 and maxPoints (when given).
 */
export const checklistResult = (checklist, checks, maxPoints) => {
  let output = ''
  let points = 0
  Object.values(checklist.list).forEach(items =>
    items.forEach(item => {
      const checked = Boolean(checks[item.id])
      const shown = item.prerequisite === null || Boolean(checks[item.prerequisite])
      const text = checked ? item.textWhenOn : item.textWhenOff
      if (shown && text) output += text + '\n\n'
      if (!item.minimumRequirement) points += checked ? item.checkedPoints : item.uncheckedPoints
    })
  )
  points = Math.max(0, points)
  if (maxPoints > 0) points = Math.min(points, maxPoints)
  return { output, points: Number(roundPoints(points)) }
}

// unchecking a check also unchecks the checks that depend on it, like on the grading page
const withoutOrphans = (checklist, checks) => {
  const items = Object.values(checklist.list).flat()
  const next = { ...checks }
  let changed = true
  while (changed) {
    changed = false
    items.forEach(item => {
      if (next[item.id] && item.prerequisite !== null && !next[item.prerequisite]) {
        next[item.id] = false
        changed = true
      }
    })
  }
  return next
}

/**
 * Shows the checklist being edited as instructors see it when grading, before it is saved.
 */
export const ChecklistPreview = ({ data, maxPoints, disabled }) => {
  const [open, setOpen] = useState(false)
  const [checks, setChecks] = useState({})

  const checklist = toGradingChecklist(data)
  const { output, points } = checklistResult(checklist, checks, maxPoints)

  return (
    <Modal
      className="checklistPreview"
      open={open}
      onOpen={() => {
        setChecks({})
        setOpen(true)
      }}
      onClose={() => setOpen(false)}
      trigger={
        <Button
          className="previewButton"
          type="button"
          size="large"
          icon="eye"
          content="Preview"
          disabled={disabled}
        />
      }
    >
      <Modal.Header>Checklist preview</Modal.Header>
      <Modal.Content scrolling>
        <p>
          This is how the checklist looks when grading, including unsaved changes. Try checking boxes to see
          the feedback text and points; nothing is saved.
        </p>
        <Grid>
          <Grid.Row columns={1}>
            <ReviewStudentChecklist
              showOutput={true}
              kind="week"
              checklist={checklist}
              checks={checks}
              checklistPoints={points}
              checklistOutput={output}
              isChecked={(current, id) => Boolean(current[id])}
              toggleCheckbox={id => () =>
                setChecks(withoutOrphans(checklist, { ...checks, [id]: !checks[id] }))
              }
              copyChecklistOutput={e => {
                // the modal is rendered inside the editor's save form; keep its submit from saving
                e.preventDefault()
                e.stopPropagation()
              }}
              preview
            />
          </Grid.Row>
        </Grid>
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" className="closePreviewButton" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  )
}

ChecklistPreview.propTypes = {
  // the checklist being edited: { topic: [row, ...] }
  data: PropTypes.object,
  // the maximum points of the checklist; points are not capped when missing
  maxPoints: PropTypes.number,
  disabled: PropTypes.bool
}

export default ChecklistPreview
