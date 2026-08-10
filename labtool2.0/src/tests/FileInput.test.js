import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileInput from '../components/FileInput'

const renderFileInput = () =>
  render(<FileInput onFileUploaded={() => {}} allowedFileTypes={['text/plain', 'application/json']} />)

describe('<FileInput />', () => {
  it('opens the file selection dialog', async () => {
    const user = userEvent.setup()
    renderFileInput()

    const uploadButton = screen.getByRole('button', { name: /upload/i })
    await user.click(uploadButton)

    expect(screen.getByText('Select file')).toBeInTheDocument()
    expect(uploadButton).toBeDisabled()
  })

  it('accepts the specified file types', async () => {
    const user = userEvent.setup()
    const { baseElement } = renderFileInput()

    await user.click(screen.getByRole('button', { name: /upload/i }))

    const fileInput = baseElement.querySelector('input[type="file"]')
    expect(fileInput).toHaveAttribute('accept', 'text/plain,application/json')
  })
})
