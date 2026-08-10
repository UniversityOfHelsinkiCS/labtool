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
    renderJsonEdit()

    const editButton = screen.getByRole('button', { name: /edit as json/i })
    await userEvent.click(editButton)

    expect(screen.getByText(/^json$/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(editButton).toBeDisabled()
  })

  it('imports valid JSON', async () => {
    const { onImport } = renderJsonEdit()
    await userEvent.click(screen.getByRole('button', { name: /edit as json/i }))

    const jsonInput = screen.getByRole('textbox')
    await userEvent.clear(jsonInput)
    await userEvent.type(jsonInput, '{{ "a": "b" }')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onImport).toHaveBeenCalledWith({ a: 'b' })
    expect(screen.queryByText(/^json$/i)).not.toBeInTheDocument()
  })

  it('displays an error for invalid JSON', async () => {
    renderJsonEdit()
    await userEvent.click(screen.getByRole('button', { name: /edit as json/i }))

    const jsonInput = screen.getByRole('textbox')
    await userEvent.clear(jsonInput)
    await userEvent.type(jsonInput, 'abc')

    expect(screen.getByText(/failed to parse json/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
