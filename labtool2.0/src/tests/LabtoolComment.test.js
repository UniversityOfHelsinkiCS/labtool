import React from 'react'
import { render, screen } from '@testing-library/react'
import { LabtoolComment } from '../components/LabtoolComment'

describe('<LabtoolComment />', () => {
  const comment = {
    id: 1,
    comment: 'Looks good',
    from: 'Pää Opettaja',
    createdAt: '2026-10-11T10:00:00.000Z'
  }

  it('marks an instructor-only comment unmistakably (#1142)', () => {
    const { container } = render(<LabtoolComment comment={{ ...comment, hidden: true }} />)

    expect(screen.getByText(/Instructors only: not shown to the student/)).toBeInTheDocument()
    expect(container.querySelector('.instructorOnlyComment')).not.toBeNull()
    expect(container.querySelector('.disabled')).toBeNull()
    expect(screen.getByText('Looks good')).toBeInTheDocument()
  })

  it('shows a comment visible to the student without the mark', () => {
    const { container } = render(<LabtoolComment comment={{ ...comment, hidden: false }} />)

    expect(screen.queryByText(/Instructors only/)).not.toBeInTheDocument()
    expect(container.querySelector('.instructorOnlyComment')).toBeNull()
    expect(screen.getByText('Looks good')).toBeInTheDocument()
  })
})
