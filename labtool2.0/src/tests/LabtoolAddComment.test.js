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
})
