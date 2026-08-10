import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Email } from '../components/pages/Email'

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const userDetails = {
  id: 2,
  email: '',
  firsts: 'Hans Peter',
  lastname: 'Backlund',
  studentNumber: '014623598',
  username: 'tiraopiskelija4'
}

const renderEmail = (props = {}) => {
  const defaultProps = {
    loading,
    user: { user: userDetails },
    resetLoading: vi.fn(),
    forceSetLoading: vi.fn(),
    updateSelf: vi.fn(),
    addRedirectHook: vi.fn()
  }

  return render(<Email {...defaultProps} {...props} />)
}

describe('<Email />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderEmail()

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders the email form for a first-time user', () => {
    renderEmail()

    expect(screen.getByRole('heading', { name: /please give your email address/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('submits the entered email address', async () => {
    const user = userEvent.setup()
    const updateSelf = vi.fn().mockResolvedValue(undefined)
    const addRedirectHook = vi.fn()
    renderEmail({ updateSelf, addRedirectHook })

    const emailInput = screen.getByRole('textbox')
    const saveButton = screen.getByRole('button', { name: /save/i })

    await user.type(emailInput, 'student@helsinki.fi')
    Object.defineProperty(saveButton.form, 'email', { value: emailInput })
    await user.click(saveButton)

    expect(addRedirectHook).toHaveBeenCalledWith({ hook: 'USER_UPDATE_' })
    expect(updateSelf).toHaveBeenCalledWith({ email: 'student@helsinki.fi' })
  })
})
