import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LabtoolAddComment } from '../components/LabtoolAddComment'

describe('<LabtoolAddComment />', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  const renderComment = (handleSubmit = vi.fn()) =>
    render(<LabtoolAddComment commentFieldId="week1" weekId={1} handleSubmit={handleSubmit} />)

  const toggle = user => user.click(screen.getByText('Add comment'))
  const textarea = () => screen.getByPlaceholderText('Your comment...')

  it('keeps the written comment when the box is collapsed and opened again (#1162)', async () => {
    const user = userEvent.setup()
    renderComment()
    await toggle(user)
    await user.type(textarea(), 'half-written comment')

    await toggle(user)
    await toggle(user)

    expect(textarea()).toHaveValue('half-written comment')
  })

  it('lets the comment area be resized vertically (#1126)', async () => {
    const user = userEvent.setup()
    renderComment()
    await toggle(user)
    expect(textarea().style.resize).toBe('vertical')
  })

  it('clears the comment after it has been submitted', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn(e => e && e.preventDefault && e.preventDefault())
    renderComment(handleSubmit)
    await toggle(user)
    await user.type(textarea(), 'done')

    await user.click(screen.getByRole('button', { name: /add reply/i }))

    expect(handleSubmit).toHaveBeenCalled()
    expect(textarea()).toHaveValue('')
  })

  describe('who can see the comment (#1142)', () => {
    const renderForTeacher = (handleSubmit = vi.fn(e => e.preventDefault())) =>
      render(<LabtoolAddComment commentFieldId="week1" weekId={1} handleSubmit={handleSubmit} allowHidden />)
    const hiddenField = container => container.querySelector('input[name="hidden"]')

    it('is visible to the student by default', async () => {
      const user = userEvent.setup()
      const { container } = renderForTeacher()
      await toggle(user)

      expect(screen.getByRole('button', { name: /student and instructors/i })).toHaveClass('active')
      expect(hiddenField(container)).not.toBeChecked()
      expect(screen.getByRole('button', { name: /add reply/i })).toBeInTheDocument()
      expect(container.querySelector('.instructorOnlyDraft')).toBeNull()
    })

    it('makes an instructor-only comment obvious while writing it', async () => {
      const user = userEvent.setup()
      const { container } = renderForTeacher()
      await toggle(user)

      await user.click(screen.getByRole('button', { name: /instructors only/i }))

      expect(hiddenField(container)).toBeChecked()
      expect(screen.getByRole('button', { name: /add instructor-only note/i })).toBeInTheDocument()
      expect(container.querySelector('.instructorOnlyDraft')).not.toBeNull()
      expect(screen.getByPlaceholderText(/not shown to the student/i)).toBeInTheDocument()
    })

    it('sends the choice with the comment and goes back to visible afterwards', async () => {
      const user = userEvent.setup()
      let submittedHidden = null
      const handleSubmit = vi.fn(e => {
        e.preventDefault()
        submittedHidden = e.target.elements.hidden.checked
      })
      const { container } = renderForTeacher(handleSubmit)
      await toggle(user)
      await user.click(screen.getByRole('button', { name: /instructors only/i }))
      await user.type(container.querySelector('textarea[name="content"]'), 'only for us')

      await user.click(screen.getByRole('button', { name: /add instructor-only note/i }))

      expect(submittedHidden).toBe(true)
      expect(hiddenField(container)).not.toBeChecked()
      expect(screen.getByRole('button', { name: /add reply/i })).toBeInTheDocument()
    })

    it('is not offered to students', async () => {
      const user = userEvent.setup()
      renderComment()
      await toggle(user)
      expect(screen.queryByRole('button', { name: /instructors only/i })).not.toBeInTheDocument()
    })
  })
})
