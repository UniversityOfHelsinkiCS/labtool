import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginPage } from '../components/pages/LoginPage'

const loading = {
  loading: false,
  loadingHooks: [],
  redirect: false,
  redirectHooks: [],
  redirectFailure: false
}

const renderLoginPage = (props = {}) => {
  const defaultProps = {
    user: {},
    loading,
    resetLoading: vi.fn(),
    forceSetLoading: vi.fn(),
    login: vi.fn()
  }

  return render(<LoginPage {...defaultProps} {...props} />)
}

describe('<LoginPage />', () => {
  it('matches the rendered snapshot', () => {
    const { asFragment } = renderLoginPage()

    expect(asFragment()).toMatchSnapshot()
  })

  it('renders the login form', () => {
    renderLoginPage()

    expect(
      screen.getByRole('heading', { name: /enter your university of helsinki username and password/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username')
    expect(screen.getByPlaceholderText(/your password/i)).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('submits the entered username and password', async () => {
    const login = vi.fn()
    renderLoginPage({ login })

    const usernameInput = screen.getByRole('textbox')
    const passwordInput = screen.getByPlaceholderText(/your password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })

    await userEvent.type(usernameInput, 'test-user')
    await userEvent.type(passwordInput, 'secret')

    Object.defineProperties(loginButton.form, {
      username: { value: usernameInput },
      password: { value: passwordInput }
    })
    await userEvent.click(loginButton)

    expect(login).toHaveBeenCalledWith({
      username: 'test-user',
      password: 'secret'
    })
  })
})
