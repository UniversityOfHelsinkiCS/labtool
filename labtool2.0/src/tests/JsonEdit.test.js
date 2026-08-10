import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import JsonEdit from '../components/JsonEdit'

const renderJsonEdit = (props = {}) => {
  const onImport = vi.fn()

  render(<JsonEdit initialData={{}} onImport={onImport} {...props} />)

  return { onImport }
}

describe('<JsonEdit />', () => {
  it('opens the JSON editor', async () => {
    const user = userEvent.setup()
    renderJsonEdit()

    const editButton = screen.getByRole('button', { name: /edit as json/i })
    await user.click(editButton)

    expect(screen.getByText(/^json$/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(editButton).toBeDisabled()
  })

  it('imports valid JSON', async () => {
    const user = userEvent.setup()
    const { onImport } = renderJsonEdit()
    await user.click(screen.getByRole('button', { name: /edit as json/i }))

    const jsonInput = screen.getByRole('textbox')
    await user.clear(jsonInput)
    await user.type(jsonInput, '{{ "a": "b" }')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onImport).toHaveBeenCalledWith({ a: 'b' })
    expect(screen.queryByText(/^json$/i)).not.toBeInTheDocument()
  })

  it('displays an error for invalid JSON', async () => {
    const user = userEvent.setup()
    renderJsonEdit()
    await user.click(screen.getByRole('button', { name: /edit as json/i }))

    const jsonInput = screen.getByRole('textbox')
    await user.clear(jsonInput)
    await user.type(jsonInput, 'abc')

    expect(screen.getByText(/failed to parse json/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
