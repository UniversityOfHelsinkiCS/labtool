import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StudentHistory } from '../components/StudentHistory'

describe('<StudentHistory />', () => {
  const entry = (id, kind, number, changes) => ({
    id,
    kind,
    number,
    changes,
    createdAt: '2026-10-11T10:00:00.000Z',
    by: 'Ossi Ohjaaja Mutikainen'
  })
  const entries = [
    entry(4, 'week_review', 8, { grade: { from: null, to: 4 } }),
    entry(3, 'code_review_grade', 1, { points: { from: null, to: 2 } }),
    entry(2, 'repository', null, {
      github: { from: 'https://github.com/a/old', to: 'https://github.com/a/new' }
    }),
    entry(1, 'week_review', 3, { points: { from: null, to: 1.5 } })
  ]
  const subjects = () => [...document.querySelectorAll('.changeHistorySubject')].map(s => s.textContent)

  it('shows all changes of the student, each labelled', () => {
    render(<StudentHistory entries={entries} weekAmount={7} />)

    expect(screen.getByText('Change history')).toBeInTheDocument()
    expect(subjects()).toEqual(['Final review · ', 'Code review 1 · ', 'Repository · ', 'Week 3 · '])
    expect(screen.getByText('Points – → 1.5')).toBeInTheDocument()
  })

  it('filters by kind of change', async () => {
    const user = userEvent.setup()
    render(<StudentHistory entries={entries} weekAmount={7} />)
    const filters = document.querySelector('.changeHistoryFilters')

    await user.click(within(filters).getByRole('button', { name: 'Week reviews' }))
    expect(subjects()).toEqual(['Final review · ', 'Week 3 · '])

    await user.click(within(filters).getByRole('button', { name: 'Code reviews' }))
    expect(subjects()).toEqual(['Code review 1 · '])

    await user.click(within(filters).getByRole('button', { name: 'Repository' }))
    expect(subjects()).toEqual(['Repository · '])

    await user.click(within(filters).getByRole('button', { name: 'All' }))
    expect(subjects()).toHaveLength(4)
  })
})
