import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
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

  describe('editing (#534)', () => {
    it('lets the author edit and save the text', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      const { container } = render(
        <LabtoolComment comment={{ ...comment, hidden: false }} canEdit onEdit={onEdit} />
      )

      await user.click(screen.getByText('Edit'))
      const textarea = container.querySelector('textarea[name="editedComment"]')
      expect(textarea).toHaveValue('Looks good')
      await user.clear(textarea)
      await user.type(textarea, 'Looks great')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(onEdit).toHaveBeenCalledWith('Looks great')
      expect(container.querySelector('textarea[name="editedComment"]')).toBeNull()
    })

    it('can cancel editing, and does not save empty text', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      const { container } = render(
        <LabtoolComment comment={{ ...comment, hidden: true }} canEdit onEdit={onEdit} />
      )

      await user.click(screen.getByText('Edit'))
      await user.clear(container.querySelector('textarea[name="editedComment"]'))
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onEdit).not.toHaveBeenCalled()
      expect(screen.getByText('Looks good')).toBeInTheDocument()
    })

    it('offers editing only for the author, and shows when a comment was edited', () => {
      render(<LabtoolComment comment={{ ...comment, hidden: false, editedAt: '2026-10-11T12:00:00.000Z' }} />)
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(document.querySelector('.commentEdited')).toHaveTextContent('(edited')
    })
  })
})
