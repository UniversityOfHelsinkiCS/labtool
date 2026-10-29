import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import ChangeHistory from './ChangeHistory'

const FILTERS = [
  { key: 'all', text: 'All', kinds: null },
  { key: 'week', text: 'Week reviews', kinds: ['week_review', 'week_draft'] },
  { key: 'codeReview', text: 'Code reviews', kinds: ['code_review_grade'] },
  { key: 'repository', text: 'Repository', kinds: ['repository'] }
]

/**
 * All recorded changes of one student's grading and repository (#1129, #1132), each labelled
 * ("Week 3", "Code review 1", "Repository") and filterable. Shown in Browse reviews.
 */
export const StudentHistory = ({ entries, weekAmount }) => {
  const [filter, setFilter] = useState('all')
  const subjectOf = entry => {
    if (entry.kind === 'repository') return 'Repository'
    if (entry.kind === 'code_review_grade') return `Code review ${entry.number}`
    const review = entry.number > weekAmount ? 'Final review' : `Week ${entry.number}`
    return entry.kind === 'week_draft' ? `${review} draft` : review
  }
  const { kinds } = FILTERS.find(f => f.key === filter)
  const shown = kinds ? entries.filter(entry => kinds.includes(entry.kind)) : entries

  return (
    <div className="studentHistory" style={{ marginTop: '2em' }}>
      <Button.Group size="small" className="changeHistoryFilters">
        {FILTERS.map(f => (
          <Button key={f.key} type="button" active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.text}
          </Button>
        ))}
      </Button.Group>
      <ChangeHistory title="Change history" entries={shown} subjectOf={subjectOf} />
    </div>
  )
}

StudentHistory.propTypes = {
  entries: PropTypes.array.isRequired,
  weekAmount: PropTypes.number
}

export default StudentHistory
