import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangeHistory } from '../components/ChangeHistory'
import changeLogReducer from '../reducers/changeLogReducer'
import { reviewedRepository } from '../util/reviewedRepository'

const entries = [
  {
    id: 2,
    kind: 'week_review',
    number: 1,
    createdAt: '2026-10-11T11:32:00.000Z',
    by: 'Aatu Assistentti',
    changes: {
      points: { from: 2, to: 2.5 },
      feedback: { from: 'Good start', to: 'Good start, now with tests' },
      instructorNotes: { from: null, to: 'Asked about the README' },
      checklist: [
        { id: 1, name: 'Tests', from: false, to: true },
        { id: 2, name: 'Lint', from: true, to: false }
      ]
    }
  },
  {
    id: 1,
    kind: 'repository',
    number: null,
    createdAt: '2026-10-10T09:00:00.000Z',
    by: 'Maarit Opiskelija',
    changes: { github: { from: 'https://github.com/old/repo', to: 'https://github.com/new/repo' } }
  }
]

describe('<ChangeHistory /> (#1129, #1132)', () => {
  it('describes each change with who made it and when', () => {
    render(<ChangeHistory title="Change history" entries={entries} />)

    expect(screen.getByText('Instructors only: not shown to the student')).toBeInTheDocument()
    expect(screen.getByText(/· Aatu Assistentti/)).toBeInTheDocument()
    expect(screen.getByText('Points 2 → 2.5')).toBeInTheDocument()
    expect(
      screen.getByText(/Checklist: 2 boxes changed \(Tests unchecked → checked, Lint checked → unchecked\)/)
    ).toBeInTheDocument()
    expect(
      screen.getByText('Repository https://github.com/old/repo → https://github.com/new/repo')
    ).toBeInTheDocument()
  })

  it('shows the old and new texts on request', async () => {
    const user = userEvent.setup()
    render(<ChangeHistory title="Change history" entries={entries} />)

    await user.click(screen.getAllByText('Show old and new text')[0])

    expect(screen.getByText('Good start')).toBeVisible()
    expect(screen.getByText('Good start, now with tests')).toBeVisible()
    expect(screen.getByText('Review notes changed')).toBeInTheDocument()
  })

  it('shows the first version as initial, not as a change from empty', async () => {
    const user = userEvent.setup()
    const initialEntries = [
      {
        id: 10,
        kind: 'week_review',
        number: 1,
        initial: true,
        createdAt: '2026-10-11T09:00:00.000Z',
        by: 'Pää Opettaja',
        changes: {
          points: { from: null, to: 2 },
          feedback: { from: null, to: 'First feedback' },
          checklist: [{ id: 1, name: 'Tests', from: false, to: true }]
        }
      },
      {
        id: 11,
        kind: 'repository',
        number: null,
        initial: true,
        createdAt: '2026-10-10T09:00:00.000Z',
        by: 'Maarit Opiskelija',
        changes: { github: { from: null, to: 'https://github.com/first/repo' } }
      }
    ]
    render(<ChangeHistory title="Change history" entries={initialEntries} />)

    expect(screen.getByText('Initial review')).toBeInTheDocument()
    expect(screen.getByText('Points 2')).toBeInTheDocument()
    expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    expect(screen.getByText('Checklist: Tests checked')).toBeInTheDocument()
    expect(screen.getByText('Repository at registration')).toBeInTheDocument()
    expect(screen.getByText('https://github.com/first/repo')).toBeInTheDocument()

    await user.click(screen.getByText('Show text'))
    expect(screen.getByText('First feedback')).toBeVisible()
  })

  it('says when nothing has been recorded', () => {
    render(<ChangeHistory title="Change history" entries={[]} />)
    expect(screen.getByText(/No changes recorded yet/)).toBeInTheDocument()
  })
})

describe('changeLogReducer', () => {
  it('stores the history and clears it when loading another one', () => {
    let state = changeLogReducer(undefined, { type: '@@INIT' })
    expect(state).toEqual({ entries: [] })
    state = changeLogReducer(state, { type: 'CHANGELOG_GET_SUCCESS', response: entries })
    expect(state.entries).toEqual(entries)
    expect(changeLogReducer(state, { type: 'CHANGELOG_GET_ATTEMPT' })).toEqual({ entries: [] })
    expect(changeLogReducer(state, { type: 'LOGOUT_SUCCESS' })).toEqual({ entries: [] })
  })
})

describe('reviewedRepository (#1132)', () => {
  it('prefers the repository at the time the link was added, then at assignment', () => {
    expect(reviewedRepository({ repoAtLinkAdded: 'a', repoAtAssignment: 'b' }, 'a').repository).toBe('a')
    expect(reviewedRepository({ repoAtAssignment: 'b' }, 'b').repository).toBe('b')
  })

  it('falls back to the current repository for older reviews, without a warning', () => {
    expect(reviewedRepository({}, 'current')).toEqual({
      repository: 'current',
      current: 'current',
      changed: false
    })
  })

  it('tells when the student has changed their repository since', () => {
    expect(reviewedRepository({ repoAtAssignment: 'old' }, 'new')).toEqual({
      repository: 'old',
      current: 'new',
      changed: true
    })
  })
})
