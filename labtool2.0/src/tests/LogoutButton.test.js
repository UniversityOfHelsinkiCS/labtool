import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LogoutButton } from '../components/LogoutButton'

describe('<LogoutButton />', () => {
  it('renders a logout button', () => {
    render(<LogoutButton logout={vi.fn()} />)

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('logs out when clicked', async () => {
    const logout = vi.fn()
    render(<LogoutButton logout={logout} />)

    await userEvent.click(screen.getByRole('button', { name: /logout/i }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})
